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
import { slugify } from "../common/utils";
import { getDepartmentByName } from "./database/departments";
import { backupReviews, getTransactionReviewCount, reconcileReviews } from "./database/review";


export { };

interface CourseObject {
    code: string;
    description: string;
    title: string;
    courseNumber: string;
    alias?: string;
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



function formatCourse(rawCourse: CourseObject): Course {
    const formattedCourse = {
        courseDescription: rawCourse.description,
        courseID: rawCourse.courseNumber,
        courseName: rawCourse.title,
        departmentID: rawCourse.courseNumber.match(/^[_a-zA-Z]{0,4}/)[0].toUpperCase(),
    };

    return formattedCourse;
}



async function getSemesterData(semester: string) {

    const searchParameters = [
        new Param("type%5B%5D", "genera%3Aoffering%2FLCT").getObject(),
        // new Param("type%5B%5D", "genera%3Aoffering%2FLAB").getObject(), // Skip labs
        // new Param("type%5B%5D", "genera%3Aoffering%2FDSC").getObject(), // Skip discussion
        // new Param("type%5B%5D", "genera%3Aoffering%2FDR1").getObject(), // Skip drills
        // new Param("type%5B%5D", "genera%3Aoffering%2FDR2").getObject(), // Skip drills
        //new Param("type%5B%5D", "genera%3Aoffering%2FPE").getObject(),   // Skip PE
        // new Param("type%5B%5D", "genera%3Aoffering%2FPLB").getObject(), // Skip Pre-Lab
        // new Param("type%5B%5D", "genera%3Aoffering%2FSCR").getObject(), // Skip screenings
        new Param("type%5B%5D", "genera%3Aoffering%2FSEM").getObject(),
        new Param("location%5B%5D", "resource%2Fplace%2Fcampus%2FM").getObject(),
        new Param("search", "Search").getObject(),
    ];


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

    const formattedInstructor: Instructor = {
        name: name,
        instructorID: instructorID,
        slug: slugify(name),
        email: undefined,
        departmentID: undefined,
    };

    await semaphore.acquire();

    const I = new directoryScraper('', instructorID);

    await new Promise((resolve) =>                  /* Stagger requests */
        setTimeout(resolve, Math.random() * 500)
    );

    try {

        await I.init();

        if (I.person) {
            const department = (await getDepartmentByName(I.person.department ?? "")) ?? null;

            /* Check if name is consistent */
            if (I.person.firstName & I.person.lastName) {
                if (I.person.firstName + " " + I.person.lastName !== name) {
                    formattedInstructor.name = `${I.person.firstName} ${I.person.lastName}`;
                    formattedInstructor.slug = slugify(`${I.person.firstName} ${I.person.lastName}`);
                }
            }

            formattedInstructor.email = I.person.email;
            formattedInstructor.departmentID = department?.departmentID ?? null;

        }
    } catch (e) {
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


    return {
        courses: courses,
        instructors: instructors,
        courseInstructors: courseInstructors,
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




async function updateSemester(semester: string, doReconciliation: boolean = false, forceUpdate: boolean = false, forceUpdateVerification: string = '') {

    const catalogCourses: CourseObject[] = await getSemesterData(semester);

    const { courses, instructors, courseInstructors } = await processCatalog(catalogCourses, semester);

    const trx = await knex.transaction();

    try {
        await upsertCourses(trx, courses);
        await upsertInstructors(trx, instructors);
        await upsertCourseInstructors(trx, courseInstructors);

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