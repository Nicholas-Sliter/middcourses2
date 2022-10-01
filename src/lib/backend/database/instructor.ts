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
        .select(["Course.courseID", "Course.courseName", "Course.courseDescription"]);

    if (!courses || courses.length == 0) {
        return null;
    }

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

    const userID = session?.user?.id ?? null;

    // instead of recent reviews lets get all reviews, calculate the averages, then return a subset of the reviews


    //const [mainQuery, reviewQuery, coursesQuery] = await Promise.all([getInstructorInfoBySlug(slug), getRecentInstructorReviews(slug, authorized), getCoursesByInstructorSlug(slug)]);
    const [mainQuery, reviewQuery, coursesQuery] = await Promise.all([getInstructorInfoBySlug(slug), getReviewByInstructorSlugWithVotes(slug, userID), getCoursesByInstructorSlug(slug)]);


    console.log(reviewQuery)

    //remove the feilds from the reviews
    const reviews = reviewQuery.map((r) => {
        const newReview = { ...r };
        delete newReview["avgEffectiveness"];
        delete newReview["avgAccommodationLevel"];
        delete newReview["avgEnthusiasm"];
        delete newReview["avgInstructorAgain"];
        return newReview;
    });

    return {
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


    }

}

