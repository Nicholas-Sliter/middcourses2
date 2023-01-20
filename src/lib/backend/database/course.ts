import knex from "./knex";
import { reviewInfo } from "./common";
import { CustomSession, public_course, public_instructor, public_review } from "../../common/types";
import { getReviewByCourseIDWithVotes } from "./review";
import { is100LevelCourse, isFYSECourse } from "../../common/utils";
import { Knex } from "knex";

export async function getCourse(id: string) {
    return await knex("Course")
        .where("Course.courseID", id)
        .first();
}


export async function upsertCourses(transaction: Knex.Transaction, courses: public_course[]) {

    try {
        return transaction("Course")
            .insert(courses)
            .onConflict("courseID")
            .merge();
    } catch (e) {
        throw e; /* Handle rollback upstream */
    }

    return;
}

/**
 * @WARNING This function is not idempotent. It will delete courses and instructors that are no longer in the scraper.
 * @WARNING Deletes will cascade to **reviews**.
 * @param transaction 
 * @param courses 
 * @param semester 
 * @returns 
 */
export async function reconcileCourses(transaction: Knex.Transaction, courses: public_course[], semester: string, ignoreWarnings: boolean = false) {

    /**
     * 1. Get all courses in db for given semester (join with CourseInstructor)
     * 2. Compare with courses from scraper
     * 3. Find courses that are in db but not in scraper
     * 4. Delete the CourseInstructor rows for those courses
     * 5. Check the db for any courses that have no CourseInstructor rows
     * 6. Delete those courses
     * 7. Looked for orphaned instructors and delete them
     */

    const WARN_THRESHOLD = 20;

    const dbCourses = await transaction("Course")
        .join("CourseInstructor", "CourseInstructor.courseID", "=", "Course.courseID")
        .where("CourseInstructor.term", semester)

    const dbCourseIDs = dbCourses.map((course: any) => course.courseID);
    const scraperCourseIDs = courses.map((course: any) => course.courseID);

    const coursesToDelete = dbCourseIDs.filter((courseID: string) => !scraperCourseIDs.includes(courseID));

    if (!coursesToDelete.length) {
        return;
    }

    if (coursesToDelete.length > WARN_THRESHOLD) {
        console.warn(`Found ${coursesToDelete.length} course(s) to delete. This is more than the warning threshold of ${WARN_THRESHOLD}.`);
        if (!ignoreWarnings) {
            throw new Error("Too many courses to delete. Aborting.");
        }
    }

    /* Check for reviews associated with courses to delete */
    const reviewsToDelete = await transaction("Review")
        .select("reviewID")
        .whereIn("courseID", coursesToDelete);

    if (reviewsToDelete.length) {
        console.warn(`Found ${reviewsToDelete.length} review(s) that will be deleted!`);
        console.log(`Reviews that will be deleted: ${JSON.stringify(reviewsToDelete, null, 4)}`)
        if (!ignoreWarnings) {
            throw new Error(`${reviewsToDelete.length} review(s) will be deleted. Aborting.`);
        }
    }

    await transaction("CourseInstructor")
        .whereIn("courseID", coursesToDelete)
        .andWhere("term", semester)
        .del();

    /* Delete courses that have no CourseInstructor rows */
    const coursesWithNoTerm = await transaction("Course")
        .whereNotExists(function () {
            this.select("*")
                .from("CourseInstructor")
                .whereRaw("CourseInstructor.courseID = Course.courseID")
        });


    const coursesWithNoTermIDs = coursesWithNoTerm.map((course: any) => course.courseID);
    console.log(`Found ${coursesWithNoTermIDs.length} courses to remove.`)
    await transaction("Course")
        .whereIn("courseID", coursesWithNoTermIDs)
        .del();

    return;

}


export async function reconcileCourseInstructors(transaction: Knex.Transaction, courseInstructors: {
    courseID: string;
    instructorID: string;
    term: string;
}[], semester: string) {

    /**
     * 1. Get all courseInstructors in db for given semester
     * 2. Compare with courseInstructors from scraper
     * 3. Find courseInstructors that are in db but not in scraper
     * 4. Delete those courseInstructors
     */

    const dbCourseInstructors = await transaction("CourseInstructor")
        .where("term", semester)

    const dbCourseInstructorIDs = dbCourseInstructors.map((courseInstructor: any) => `${courseInstructor.courseID}-${courseInstructor.instructorID}-${courseInstructor.term}`);
    const scraperCourseInstructorIDs = courseInstructors.map((courseInstructor: any) => `${courseInstructor.courseID}-${courseInstructor.instructorID}-${courseInstructor.term}`);

    const courseInstructorsToDelete = dbCourseInstructorIDs.filter((courseInstructorID: string) => !scraperCourseInstructorIDs.includes(courseInstructorID));

    if (!courseInstructorsToDelete.length) {
        return;
    }

    const courseInstructorsToDeleteObject = courseInstructorsToDelete.map((courseInstructorID: string) => {
        const [courseID, instructorID, term] = courseInstructorID.split("-");

        return {
            courseID,
            instructorID,
            term
        }
    });



    await transaction("CourseInstructor")
        .whereIn("courseID", courseInstructorsToDeleteObject.map((courseInstructor: any) => courseInstructor.courseID))
        .whereIn("instructorID", courseInstructorsToDeleteObject.map((courseInstructor: any) => courseInstructor.instructorID))
        .andWhere("term", semester)
        .del();

    return;



}



async function getCourseReviews(id: string, session: CustomSession, authorized: boolean) {

    // if (!authorized) {
    //     return [];
    // }

    // return await knex("Review")
    //     .where("Review.courseID", id)
    //     .select(reviewInfo);
    //console.log(session?.user?.id);
    return await getReviewByCourseIDWithVotes(id, session?.user?.id);
}


export async function getCoursesInformation(ids: string[]) {
    return await knex("Course")
        .whereIn("Course.courseID", ids)
        .select(["Course.courseName", "Course.courseID", "Course.courseDescription"]);

}



async function getCourseInfo(id: string) {
    return await knex("Course")
        .where({ "Course.courseID": id })
        .select(["Course.courseName", "Course.courseDescription", "Course.departmentID", "Course.courseID"])
        .leftJoin("CourseInstructor", "Course.courseID", "CourseInstructor.courseID")
        .distinct("CourseInstructor.instructorID")
        .leftJoin("Instructor", "CourseInstructor.instructorID", "Instructor.instructorID")
        .select(["Instructor.instructorID", "Instructor.name", "Instructor.slug"])
        .leftJoin("Department", "Course.departmentID", "Department.departmentID")
        .select(["Department.departmentName"]);
}

export async function optimizedSSRCoursePage(id: string, session: CustomSession) {

    const COURSE_MIN_AVG_COUNT = 3; // require 3 reviews to show avgs

    const authorized: boolean = session?.user?.authorized ||
        session?.user?.role === "admin" ||
        session?.user?.role === "faculty" ||
        is100LevelCourse(id) ||
        isFYSECourse(id);

    const outputFormatter = (results, reviews) => {
        if (!results) {
            return null;
        }

        const parseAvg = (avg: string | null) => {
            if (!avg) {
                return null;
            }
            return parseFloat(avg);
        }

        const output = {
            courseID: results[0].courseID as string,
            courseName: results[0].courseName as string,
            courseDescription: results[0].courseDescription as string,
            departmentID: results[0].departmentID as string,
            departmentName: results[0].departmentName as string,
            instructors: [] as public_instructor[],
            reviews: [] as public_review[],
            avgRating: parseAvg(reviews?.[0]?.avgRating),
            avgDifficulty: parseAvg(reviews?.[0]?.avgDifficulty),
            avgHours: parseAvg(reviews?.[0]?.avgHours),
            avgValue: parseAvg(reviews?.[0]?.avgValue),
            avgAgain: parseAvg(reviews?.[0]?.avgAgain),
            numReviews: reviews.length,
            topTags: [] as string[],

        }

        // remove averages from reviews
        const updatedReviews: public_review[] = reviews.map((review) => {
            const newReview = { ...review };
            delete newReview.avgRating
            delete newReview.avgDifficulty;
            delete newReview.avgHours;
            delete newReview.avgValue;
            delete newReview.avgAgain;
            return newReview;
        });


        output.reviews.push(...updatedReviews);


        if (!authorized || session?.user?.banned) {
            output.reviews = [];
        }


        //build a freq list of tags, return the top 3 if they have a freq of 2 or more
        const tagFreq: { [key: string]: number } = {};
        for (const review of reviews) {
            for (const tag of review?.tags ?? []) {
                if (tagFreq[tag]) {
                    tagFreq[tag]++;
                } else {
                    tagFreq[tag] = 1;
                }
            }
        }

        // return the top 3 tags if they have a freq of 3 or more
        const MIN_TAG_FREQ = 3;
        const tagFreqList = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]);
        for (let i = 0; i < 3; i++) {
            if (tagFreqList[i] && tagFreqList[i][1] >= MIN_TAG_FREQ) {
                output.topTags.push(tagFreqList[i][0]);
            }
        }

        results.forEach((result) => {
            output.instructors.push({
                instructorID: result.instructorID,
                name: result.name,
                slug: result.slug,
            });
        });

        if (output.reviews.length < COURSE_MIN_AVG_COUNT) {
            output.avgRating = null;
            output.avgDifficulty = null;
            output.avgHours = null;
            output.avgValue = null;
            output.avgAgain = null;
        }

        return output;

    }

    // use PostgreSQL Array_agg in prod

    const [mainQuery, reviewQuery] = await Promise.all([getCourseInfo(id), getCourseReviews(id, session, authorized)]);

    return (outputFormatter(mainQuery, reviewQuery));

}

