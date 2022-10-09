import knex from "./knex";
import { reviewInfo } from "./common";
import { CustomSession, public_instructor, public_review } from "../../common/types";
import { sortCoursesByTerm } from "../../common/utils";
import { getReviewByInstructorSlugWithVotes } from "./review";


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
        return newReview;
    });


    const obj = {
        instructor: {
            ...mainQuery,
            avgEffectiveness: reviewQuery?.[0]?.avgEffectiveness,
            avgAccommodationLevel: reviewQuery?.[0]?.avgAccommodationLevel,
            avgEnthusiasm: reviewQuery?.[0]?.avgEnthusiasm,
            avgAgain: reviewQuery?.[0]?.avgInstructorAgain,
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
    }


    //If not authorized, we want to limit the number of reviews that can be seen
    if (!session?.user?.authorized) {
        obj.reviews = obj.reviews.slice(0, NUM_UNAUTH_REVIEWS);
    }

    return obj;

}

