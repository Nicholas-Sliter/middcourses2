import knex from "./knex";
import { reviewInfo } from "./common";
import { CustomSession, public_instructor, public_review } from "../../common/types";
import { sortCoursesByTerm } from "../../common/utils";
import { getReviewByInstructorSlugWithVotes } from "./review";
import { Knex } from "knex";


const DELIMITER = "|\0|";

const quote = (str: string) => {
    return (str.split(".").map((s) => `"${s}"`).join("."));
}


export async function getCoursesByInstructorSlug(slug: string) {
    //search through the CourseInstructor table for all instructors associated with a course
    const courses = await knex("Instructor")
        .where({
            slug: slug,
        })
        .select(["Instructor.instructorID"])
        .join("CourseInstructor", "CourseInstructor.instructorID", "Instructor.instructorID")
        .select("term")
        .join("Course", "Course.courseID", "CourseInstructor.courseID")
        .select(["Course.courseID", "Course.courseName", "Course.courseDescription"])
        .leftJoin("Review", function () {
            this.on("Course.courseID", "Review.courseID")
                .andOn("Instructor.instructorID", "Review.instructorID")
                .andOn("Review.semester", "CourseInstructor.term")
        })
        .groupBy(["Course.courseID", "CourseInstructor.term", "Review.semester", "Instructor.instructorID"])
        .count("Review.reviewID as numReviews");



    return courses;
}


export async function getCoursesByInstructorID(id: string) {
    //search through the CourseInstructor table for all instructors associated with a course
    const courses = await knex("CourseInstructor")
        .where({
            instructorID: id,
        })
        .join("Course", "Course.courseID", "CourseInstructor.courseID")
        .select(["courseID", "courseName", "courseDescription"]);

    if (!courses || courses.length == 0) {
        return null;
    }

    return courses;
}



async function getInstructorInfoBySlug(slug: string) {
    return await knex("Instructor")
        .where("Instructor.slug", slug)
        .first()
        .leftJoin("Department", "Instructor.departmentID", "Department.departmentID")
        .select([
            "Instructor.name",
            "Instructor.instructorID",
            "Instructor.slug",
            "Instructor.departmentID",
            "Instructor.email",
            "Department.departmentName",
        ]);

}

//need to get courses too!!!


async function getRecentInstructorReviews(slug: string, authorized: boolean) {
    if (!authorized) {
        return [];
    }

    const res = await knex("Instructor")
        .where("Instructor.slug", slug)
        .join("Review", "Instructor.instructorID", "Review.instructorID")
        .select(reviewInfo)
        .limit(5)

    return res;

}

async function getRecentInstructorCourses() {

}




export async function optimizedSSRInstructorPage(slug: string, session: CustomSession) {

    const INSTRUCTOR_MIN_AVG_COUNT = 5;
    const NUM_UNAUTH_REVIEWS = 3;

    const userID = session?.user?.id ?? null;


    //const [mainQuery, reviewQuery, coursesQuery] = await Promise.all([getInstructorInfoBySlug(slug), getRecentInstructorReviews(slug, authorized), getCoursesByInstructorSlug(slug)]);
    const [mainQuery, reviewQuery, coursesQuery] = await Promise.all([getInstructorInfoBySlug(slug), getReviewByInstructorSlugWithVotes(slug, userID), getCoursesByInstructorSlug(slug)]);


    //remove the feilds from the reviews
    const reviews = reviewQuery.map((r) => {
        const newReview = { ...r };
        delete newReview["avgEffectiveness"];
        delete newReview["avgAccommodationLevel"];
        delete newReview["avgEnthusiasm"];
        delete newReview["avgInstructorAgain"];
        delete newReview["avgInstructorEnjoyed"];
        return newReview;
    });


    const obj = {
        instructor: {
            ...mainQuery,
            avgEffectiveness: reviewQuery?.[0]?.avgEffectiveness,
            avgAccommodationLevel: reviewQuery?.[0]?.avgAccommodationLevel,
            avgEnthusiasm: reviewQuery?.[0]?.avgEnthusiasm,
            avgAgain: reviewQuery?.[0]?.avgInstructorAgain,
            avgEnjoyed: reviewQuery?.[0]?.avgInstructorEnjoyed,
            numReviews: reviewQuery.length,
        } as public_instructor,
        courses: sortCoursesByTerm(coursesQuery),
        reviews: reviews as public_review[],
    };

    // We want at least INSTRUCTOR_MIN_AVG_COUNT reviews to show the averages
    if (reviews.length < INSTRUCTOR_MIN_AVG_COUNT) {
        delete obj.instructor.avgEffectiveness;
        delete obj.instructor.avgAccommodationLevel;
        delete obj.instructor.avgEnthusiasm;
        delete obj.instructor.avgAgain;
        delete obj.instructor.avgEnjoyed;
    }


    //If not authorized, we want to limit the number of reviews that can be seen
    if (!session?.user?.authorized) {
        obj.reviews = obj.reviews.slice(0, NUM_UNAUTH_REVIEWS);
    }


    return obj;

}




export async function upsertInstructors(transaction: Knex.Transaction, instructors: {
    name: string;
    slug: string;
    instructorID: string;
    email: string;
    departmentID: string;
}[]) {

    try {

        return transaction("Instructor")
            .insert(instructors)
            .onConflict(["instructorID"])
            .merge();

    } catch (err) {
        throw err; /* Handle rollback upstream */
    }

}


/**
 * @Warning: This function will delete instructors that are not associated with any courses. It will cascade delete all **reviews** associated with the instructor.
 * @param transaction 
 * @returns void
 */
export async function reconcileInstructors(transaction: Knex.Transaction) {

    /* Delete orphaned instructors */
    const instructorsWithNoCourse = await transaction("Instructor")
        .leftJoin("CourseInstructor", "Instructor.instructorID", "CourseInstructor.instructorID")
        .whereNull("CourseInstructor.instructorID")
        .select("Instructor.instructorID");

    const instructorsWithNoCourseIDs = instructorsWithNoCourse.map((instructor: any) => instructor.instructorID);
    console.log(`Found ${instructorsWithNoCourseIDs.length} instructors to remove.`)
    await transaction("Instructor")
        .whereIn("instructorID", instructorsWithNoCourseIDs)
        .del();

    return;
}



export async function upsertCourseInstructors(transaction: Knex.Transaction, courseInstructors: {
    courseID: string;
    instructorID: string;
    term: string;
}[]) {

    try {

        /* This method is necessary as we don't have a unique constraint over the necessary columns */

        const ci = await transaction("CourseInstructor")
            .select("courseID", "instructorID", "term");

        const ciSet = new Set(ci.map((c) => {
            return `${c.courseID}-${c.instructorID}-${c.term}`;
        }));

        const toInsert = courseInstructors.filter((c) => {
            return !ciSet.has(`${c.courseID}-${c.instructorID}-${c.term}`);
        });

        if (toInsert.length > 0) {

            return transaction("CourseInstructor")
                .insert(toInsert);
        }
    }
    catch (err) {
        throw err; /* Handle rollback upstream */
    }

    return;

}