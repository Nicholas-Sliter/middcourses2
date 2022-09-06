import knex from "./knex";
import { reviewInfo } from "./common";
import { public_instructor, public_review } from "../../common/types";

export async function getCourse(id: string) {
    return await knex("Course")
        .where("Course.courseID", id)
        .first();
}

async function getCourseReviews(id: string, authorized: boolean) {
    if (!authorized) {
        return [];
    }

    return await knex("Review")
        .where("Review.courseID", id)
        .select(reviewInfo);
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
        .select(["Department.departmentName"])
}

export async function optimizedSSRCoursePage(id: string, authorized: boolean) {
    const outputFormatter = (results, reviews) => {
        if (!results) {
            return null;
        }
        const output = {
            courseID: results[0].courseID as string,
            courseName: results[0].courseName as string,
            courseDescription: results[0].courseDescription as string,
            departmentID: results[0].departmentID as string,
            departmentName: results[0].departmentName as string,
            instructors: [] as public_instructor[],
            reviews: reviews as public_review[],
        }

        results.forEach((result) => {
            output.instructors.push({
                instructorID: result.instructorID,
                name: result.name,
                slug: result.slug,
            });
        });

        return output;

    }

    // use PostgreSQL Array_agg in prod

    const [mainQuery, reviewQuery] = await Promise.all([getCourseInfo(id), getCourseReviews(id, authorized)]);

    // return {
    //     courseID: mainQuery.courseID,
    //     reviews: reviewQuery,
    // }
    return (outputFormatter(mainQuery, reviewQuery));

}

