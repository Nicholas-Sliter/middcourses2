/**
 *  Data pipeline to update existing db without reseeding for a given semester's data
 * 
 * */

import departmentsScraper from "departments.js";
import catalogScraper from "catalog.js";
import { Scraper as directoryScraper } from "directory.js";
import Param from 'catalog.js/lib/classes/Param.js';
import { public_course, public_instructor } from "../common/types";
import { reconcileCourseInstructors, reconcileCourses, upsertCourses } from "./database/course";
import { reconcileInstructors, upsertCourseInstructors, upsertInstructors } from "./database/instructor";
import { Knex } from "knex";
import knex from "./database/knex";
import Semaphore from './semaphore';
import { departmentCodeChangedMapping, getCurrentSemester, getCurrentTerm, getNextTerm, slugify } from "../common/utils";
import { getDepartmentByName, getMostFrequentlyTaughtDepartment } from "./database/departments";
import { backupReviews, getTransactionReviewCount, reconcileReviews } from "./database/review";
import { reconileAliases, upsertAliases } from "./database/alias";
import { upsertCatalogCourses } from "./database/schedule";


export { };

interface CourseObject {
    code: string;
    description: string;
    title: string;
    courseNumber: string;
    alias?: {
        id: string;
    }[]
    instructors: {
        rawID: string;
        href: string;
        name: string;
        text: string;
        id: string;
    }[];
}

interface Course {
    courseID: string,
    courseName: string,
    courseDescription: string,
    departmentID: string,
}

interface InstructorObject {
    rawID?: string;
    href?: string;
    name: string;
    text?: string;
    id: string;
}

interface Instructor {
    name: string;
    slug: string;
    instructorID: string;
    email: string;
    departmentID: string;
}


interface CourseInstructor {
    courseID: string;
    instructorID: string;
    term: string;
}


interface Alias {
    aliasID: string;
    courseID: string; /* Primary course ID */
    term: string;
}



function formatCourse(rawCourse: CourseObject): Course {
    const formattedCourse = {
        courseDescription: rawCourse.description,
        courseID: rawCourse.courseNumber,
        courseName: rawCourse.title,
        departmentID: rawCourse.courseNumber.match(/^[_a-zA-Z]{0,4}/)[0].toUpperCase(),
    };

    return formattedCourse;
}



async function getSemesterData(semester: string, getLabTypeCourses = false, departmentID?: string) {

    const searchParameters = [];


    if (!getLabTypeCourses) {

        searchParameters.push(...[new Param("type%5B%5D", "genera%3Aoffering%2FLCT").getObject(),
        // new Param("type%5B%5D", "genera%3Aoffering%2FLAB").getObject(), // Skip labs
        // new Param("type%5B%5D", "genera%3Aoffering%2FDSC").getObject(), // Skip discussion
        // new Param("type%5B%5D", "genera%3Aoffering%2FSCR").getObject(), // Skip screenings
        // new Param("type%5B%5D", "genera%3Aoffering%2FDR1").getObject(), // Skip drills
        // new Param("type%5B%5D", "genera%3Aoffering%2FDR2").getObject(), // Skip drills
        // new Param("type%5B%5D", "genera%3Aoffering%2FPE").getObject(),   // Skip PE
        // new Param("type%5B%5D", "genera%3Aoffering%2FPLB").getObject(), // Skip Pre-Lab
        new Param("type%5B%5D", "genera%3Aoffering%2FSEM").getObject(),

        new Param("location%5B%5D", "resource%2Fplace%2Fcampus%2FM").getObject(),
        new Param("search", "Search").getObject(),
        ]);
    } else {
        searchParameters.push(...[
            new Param("type%5B%5D", "genera%3Aoffering%2FLAB").getObject(), // Skip labs
            new Param("type%5B%5D", "genera%3Aoffering%2FDSC").getObject(), // Skip discussion
            new Param("type%5B%5D", "genera%3Aoffering%2FSCR").getObject(), // Skip screenings

            new Param("location%5B%5D", "resource%2Fplace%2Fcampus%2FM").getObject(),
            new Param("search", "Search").getObject(),
        ]);
    }

    /* Granular department-specific search */
    /* This allows us to bypass the catalog server failing on large requests */
    /* See #289 */
    if (departmentID) {
        searchParameters.push(new Param("department", `topic%2Fsubject%2F${departmentID}`).getObject());
    }



    const S = new catalogScraper({
        term: semester,
        searchParameters,
        filepath: null,
    });


    await S.scrape();
    await S.parse();

    return S.catalog.courses;

}



async function fetchInstructorData(instructorID: string, name: string, semaphore: Semaphore) {


    /* This is the best we can do for now */
    let firstName = name.split(' ')[0];
    let lastName = name.split(' ')[1];

    /* try searching by first name only if name has multiple parts */
    let shouldUseLastName = true;
    if (name.split(' ').length > 2) {
        console.log(`Name has more than 2 parts: ${name}, using first name (${firstName}) only`);
        shouldUseLastName = false;
    }


    const formattedInstructor: Instructor = {
        name: name,
        instructorID: instructorID,
        slug: slugify(name),
        email: undefined,
        departmentID: undefined,
    };

    await semaphore.acquire();

    const I = new directoryScraper('', instructorID, firstName, shouldUseLastName ? lastName : "");

    await new Promise((resolve) =>                  /* Stagger requests */
        setTimeout(resolve, Math.random() * 800)
    );

    try {

        await I.init();

        if (I.person) {
            let department = (await getDepartmentByName(I.person.department ?? "")) ?? null;
            if (!department) {
                console.log(`Could not find department for ${instructorID}: ${I.person.department}`);
                department = await getMostFrequentlyTaughtDepartment(instructorID) ?? null;
                if (department) {
                    console.log(`Using most frequently taught department for ${instructorID}: ${department.departmentID}`);
                }
            }

            /* Check if name is consistent */
            const directoryName = I.person.firstName + " " + I.person.lastName;
            if (I.person.firstName && I.person.lastName) {
                if (directoryName !== name) {
                    console.log(`Inconsistent name for ${instructorID}: ${name} vs ${directoryName}`);
                    // if name from directory has parens, do not update
                    if (!(directoryName.includes("(") || directoryName.includes(")"))) {
                        console.log(`Updating name for ${instructorID} from ${name} to ${directoryName}`);
                        formattedInstructor.name = directoryName;
                        formattedInstructor.slug = slugify(directoryName);
                    }
                }
            }

            formattedInstructor.email = I.person.email;
            formattedInstructor.departmentID = department?.departmentID ?? null;

        }
    } catch (e) {
        console.log(`Failed to fetch instructor data for ${name}:${instructorID}`);
        console.log(e);
    }

    semaphore.release();


    return formattedInstructor;




}



async function processInstructors(rawInstructors: InstructorObject[]) {

    const maxConcurrent = 10;
    const semaphore = new Semaphore(maxConcurrent);

    const formattedInstructors: Instructor[] = [];

    const promises = rawInstructors.map(async (instructor) => {
        return fetchInstructorData(instructor.id, instructor.name, semaphore);
    });


    await Promise.allSettled(promises);

    for (const promise of promises) {
        const instructor = await promise;
        if (instructor) {
            formattedInstructors.push(instructor);
        }
    }

    return formattedInstructors;
}




async function processCatalog(catalogCourses: CourseObject[], semester: string): Promise<{
    courses: Course[],
    instructors: Instructor[],
    courseInstructors: CourseInstructor[],
    aliases: Alias[],
}> {


    /* Instructors */
    const uniqueInstructors = new Map<string, InstructorObject>();

    catalogCourses.forEach((course) => {
        course.instructors.forEach((instructor: InstructorObject) => {
            uniqueInstructors[instructor.id] = instructor;
        })
    });

    const instructors = await processInstructors(Object.values(uniqueInstructors));


    /* Courses */
    const uniqueCourses = new Map<string, CourseObject>();

    catalogCourses.forEach((course) => {
        const formattedCourse: Course = formatCourse(course);
        uniqueCourses[formattedCourse.courseID] = formattedCourse;
    });

    const courses = Object.values(uniqueCourses);

    /* CourseInstructors */
    const uniqueCourseInstructors = new Map<string, CourseInstructor>();

    catalogCourses.forEach((course) => {
        course.instructors.forEach((instructor: InstructorObject) => {
            const formattedCourseInstructor: CourseInstructor = {
                courseID: course.courseNumber,
                instructorID: instructor.id,
                term: semester
            };

            const key = `${formattedCourseInstructor.courseID}-${formattedCourseInstructor.instructorID}`;
            uniqueCourseInstructors[key] = formattedCourseInstructor;

        })
    });

    const courseInstructors = Object.values(uniqueCourseInstructors);


    /* Aliases */
    const aliases: Alias[] = [];

    catalogCourses.forEach((course) => {
        if (course.alias) {
            /**
             * Alias is actually reversed here.
             * A course has an alias if its title has "please register via XXXXX".
             * But that alias is actually the id of the primary course.
             */
            course.alias.forEach((courseAlias) => {

                const alias: Alias = {
                    courseID: parseAliasID(courseAlias.id),
                    aliasID: course.courseNumber,
                    term: semester
                };
                aliases.push(alias);
            });
        }
    });


    return {
        courses: courses,
        instructors: instructors,
        courseInstructors: courseInstructors,
        aliases: aliases,
    }
}


/**
 * Reconciles the catalog data with the database
 * This function will reconcile the catalog data with the database if the catalog data has changed since previous inserts for a given semester.
 * This ensures the database stays consistent with the catalog data. (For example, if a course is removed from the catalog, it will be removed from the database)
 * @WARNING This function will cascade delete **reviews** if a reviewed course is removed from the catalog.
 * @param semester The semester to reconcile
 * @param courses The courses to reconcile
 * @param instructors The instructors to reconcile
 * @param courseInstructors The courseInstructors to reconcile
 * @returns void
 */
async function doReconciliationProcess(
    semester: string,
    courses: Course[],
    instructors: Instructor[],
    courseInstructors: CourseInstructor[],
    aliases: Alias[],
    forceUpdate: boolean = false,
    forceUpdateVerification: string = '',
): Promise<void> {

    console.log('Beginning reconciliation process')

    /* Backup review database */
    await backupReviews();

    const trx = await knex.transaction();
    const shouldForceUpdate = forceUpdate && (forceUpdateVerification === 'DELETE MANY REVIEWS');

    if (shouldForceUpdate) {
        console.warn(`Force update enabled`);
    }


    try {
        const beforeReviewCount = (await getTransactionReviewCount(trx)).count;

        /* This order is important! */
        await reconcileCourseInstructors(trx, courseInstructors, semester);
        await reconcileCourses(trx, courses, semester, forceUpdate);
        await reconcileInstructors(trx);
        await reconcileReviews(trx, semester, shouldForceUpdate)
        await reconileAliases(trx, aliases, semester);

        const afterReviewCount = (await getTransactionReviewCount(trx)).count;


        if (shouldForceUpdate) {
            console.log('Force update enabled - skipping review count verification');
            console.log(`Removed ${beforeReviewCount - afterReviewCount} reviews.`)
        }

        if (!shouldForceUpdate && (beforeReviewCount !== afterReviewCount)) {
            throw new Error('Review count mismatch after reconciliation');
        }

    } catch (e) {
        await trx.rollback();
        console.log('Rolled back transaction');
        console.error('Failed to reconcile semester data with error: ', e);
        return;
    }

    await trx.commit();
    console.log('Committed transaction - Reconciliation complete');


    return;
}


function isProperCourseIdFormat(courseID: string): boolean {
    const regex = /^[A-Z]{4}[0-9]{4}$/;
    return regex.test(courseID);
}

function parseAliasID(aliasID: string): string {
    /**
     * Example Alias format ENVS 1044A
     * Wanted format        ENVS1044
     * 
     * 
     * Also need to do department mapping
     */

    if (isProperCourseIdFormat(aliasID)) {
        return aliasID;
    }

    const department = aliasID.split(' ')[0];
    const courseNumber = aliasID.split(' ')[1].replace(/[A-Z]/g, '');

    const paddedDepartment = department.padStart(4, '_');
    const mappedDepartment = departmentCodeChangedMapping(paddedDepartment);

    return `${mappedDepartment}${courseNumber}`;
}


async function updateSemester(semester: string, doReconciliation: boolean = false, forceUpdate: boolean = false, forceUpdateVerification: string = '', departmentID?: string) {

    const catalogCourses = await getSemesterData(semester, false, departmentID);

    const { courses, instructors, courseInstructors, aliases } = await processCatalog(catalogCourses as CourseObject[], semester);

    const updateSemesters = [getCurrentTerm(), getNextTerm(), getNextTerm(getNextTerm())];
    const shouldUpdateCatalogCourses = updateSemesters.includes(semester);

    const trx = await knex.transaction();

    try {
        await upsertCourses(trx, courses);
        await upsertInstructors(trx, instructors);
        await upsertCourseInstructors(trx, courseInstructors);
        await upsertAliases(trx, aliases);
        if (shouldUpdateCatalogCourses) {
            const catalogLabCourses = await getSemesterData(semester, true, departmentID); /* this gets us lab-like courses */
            await upsertCatalogCourses(trx, [...catalogCourses, ...catalogLabCourses], semester);
        }

    } catch (e) {
        await trx.rollback();
        console.log('Rolled back transaction');
        console.error('Failed to update semester data with error: ', e);
        return;
    }


    await trx.commit();
    console.log('Committed transaction');

    /* DANGER ZONE: this can delete review data */
    if (doReconciliation) {
        await doReconciliationProcess(
            semester,
            courses,
            instructors,
            courseInstructors,
            aliases,
            forceUpdate,
            forceUpdateVerification
        );
    }

    return {
        courses: courses,
        instructors: instructors,
        courseInstructors: courseInstructors,
    };

}


export default updateSemester;