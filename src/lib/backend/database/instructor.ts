import knex from "./knex";
import { reviewInfo } from "./common";
import { public_instructor, public_review } from "../../common/types";
import { sortCoursesByTerm } from "../../common/utils";


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




export async function optimizedSSRInstructorPage(slug: string, authorized: boolean) {


    // instead of recent reviews lets get all reviews, calculate the averages, then return a subset of the reviews


    const [mainQuery, reviewQuery, coursesQuery] = await Promise.all([getInstructorInfoBySlug(slug), getRecentInstructorReviews(slug, authorized), getCoursesByInstructorSlug(slug)]);

    console.log(reviewQuery)

    return {
        instructor: mainQuery,
        courses: sortCoursesByTerm(coursesQuery),
        reviews: reviewQuery,
    }

    //subQueryBuilder
    // return await knex("Review")
    //     .whereIn("Review.instructorID", (subQueryBuilder) => {
    //         subQueryBuilder.select("Instructor.instructorID")
    //             .from("Instructor")
    //             .where("Instructor.slug", slug)
    //     })
    //     .select(reviewInfo)

    // return await knex.raw(`SELECT json_build_object(
    //                         'instructor', json_build_object(
    //                             'name', "Instructor"."name",
    //                             'instructorID', "Instructor"."instructorID",
    //                             'slug', "Instructor"."slug",
    //                             'departmentID', "Instructor"."departmentID",
    //                             'email', "Instructor"."email"
    //                         ),
    //                         'reviews', ARRAY_AGG(json_build_object(
    //                             'content', "Review"."content"
    //                         ))) as "data"
    //                         FROM "Instructor" 
    //                         LEFT JOIN "Review" ON "Instructor"."instructorID" = "Review"."instructorID"
    //                         WHERE "Instructor"."slug" = ?
    //                         GROUP BY "Instructor"."instructorID", "Review"."reviewID"`
    //     , [slug])

    //this is getting too complicated, just use multiple queries

}

