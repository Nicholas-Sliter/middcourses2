import knex from "./knex";
import { reviewInfo } from "./common";
import { CustomSession, public_instructor, public_review } from "../../common/types";
import { sortCoursesByTerm } from "../../common/utils";
import { Knex } from "knex";

/**
 * Rule-based recommendations
 * 
 */




export function generateBaseCourseAverages(qb: Knex.QueryBuilder, count: number = 3) {

    ///THIS CODE IS INCORRECT!  NEED SAME FIX AS DEPT PAGE
    return qb.from("Review").where({
        "Review.deleted": false,
        "Review.archived": false
    })
        .groupBy(["Review.courseID"])
        .havingRaw(`count("Review"."courseID") >= ?`, [count])
        .select(["Review.courseID"])
        .select([
            knex.raw(`(SELECT AVG("difficulty") FROM "Review") as "avgDifficulty"`),
            knex.raw(`(SELECT AVG("hours") FROM "Review") as "avgHours"`),
            knex.raw(`(SELECT AVG("again"::int::float4) FROM "Review") as "avgAgain"`),
            knex.raw(`(SELECT AVG("rating") FROM "Review") as "avgRating"`),
            knex.raw(`(SELECT AVG("value") FROM "Review") as "avgValue"`),
            knex.raw(`(SELECT AVG("instructorEffectiveness") FROM "Review") as "avgInstructorEffectiveness"`),
            knex.raw(`(SELECT AVG("instructorAccommodationLevel") FROM "Review") as "avgInstructorAccommodationLevel"`),
            knex.raw(`(SELECT AVG("instructorEnthusiasm") FROM "Review") as "avgInstructorEnthusiasm"`),
            knex.raw(`(SELECT AVG("instructorAgain"::int::float4) FROM "Review") as "avgInstructorAgain"`),
            knex.raw(`(SELECT AVG("instructorEnjoyed"::int::float4) FROM "Review") as "avgInstructorEnjoyed"`)
        ])

}



export function generateBaseInstructorAverages(qb: Knex.QueryBuilder, count: number = 3) {

    return qb.with("InstructorReview", qb => qb.from("Review").where({
        "Review.deleted": false,
        "Review.archived": false
    })
        .select(reviewInfo)
    )
        .from("InstructorReview")
        .groupBy(["InstructorReview.instructorID"])
        .select(["InstructorReview.instructorID"])
        .select([
            knex.raw(`(SELECT AVG("difficulty") FROM "InstructorReview") as "avgDifficulty"`),
            knex.raw(`(SELECT AVG("hours") FROM "InstructorReview") as "avgHours"`),
            knex.raw(`(SELECT AVG("again"::int::float4) FROM "InstructorReview") as "avgAgain"`),
            knex.raw(`(SELECT AVG("rating") FROM "InstructorReview") as "avgRating"`),
            knex.raw(`(SELECT AVG("value") FROM "InstructorReview") as "avgValue"`),
            knex.raw(`(SELECT AVG("instructorEffectiveness") FROM "InstructorReview") as "avgInstructorEffectiveness"`),
            knex.raw(`(SELECT AVG("instructorAccommodationLevel") FROM "InstructorReview") as "avgInstructorAccommodationLevel"`),
            knex.raw(`(SELECT AVG("instructorEnthusiasm") FROM "InstructorReview") as "avgInstructorEnthusiasm"`),
            knex.raw(`(SELECT AVG("instructorAgain"::int::float4) FROM "InstructorReview") as "avgInstructorAgain"`),
            knex.raw(`(SELECT AVG("instructorEnjoyed"::int::float4) FROM "InstructorReview") as "avgInstructorEnjoyed"`)
        ])

}


export function getUserReviews(qb: Knex.QueryBuilder, userID: string) {
    return qb.from("Review")
        .where({
            "Review.deleted": false,
            "Review.archived": false,
            "Review.reviewerID": userID
        })
        .select(reviewInfo);
}


export function getUserReviewedDepartments(qb: Knex.QueryBuilder, userID: string) {
    return qb.with("userReviews", (qb) => getUserReviews(qb, userID))
        .from("userReviews")
        .leftJoin("Course", "userReviews.courseID", "Course.courseID")
        .select(["Course.departmentID"])
        .distinct("Course.departmentID");
}


export function getUserReviewedDepartmentCourseCodes(qb: Knex.QueryBuilder, userID: string) {
    return knex.with("reviewedDepartments", (qb) => {
        qb.from("reviewedDepartments")
            .join("Course", "reviewedDepartments.departmentID", "Course.departmentID")
            .select(["Course.departmentID", "Course.courseID"])
            /* Make sure courses have not already been reviewed */
            .with("userReviews", (qb) => {
                qb.from("userReviews")
                    .join("Course", "userReviews.courseID", "Course.courseID")
                    .select(["Course.courseID"])
                    .distinct("Course.courseID")
            })
            .whereNotIn("Course.courseID", knex.select("userReviews.courseID").from("userReviews"))
    }
    )
}



/**
 * Get the top value-for-difficulty courses
 * @param limit The max number of courses to return
 * @returns A list of such courses
 */

export async function getTopValueForDifficultyCourses(limit: number = 10): Promise<public_instructor[]> {

    const courses = await knex.with("Base", (qb) => generateBaseCourseAverages(qb))
        .from("Base")
        .select("*")
        .where("Base.avgDifficulty", "<=", 5)
        .where("Base.avgValue", ">=", 7)
        .where("Base.avgAgain", ">=", 0.6)
        /* sort by value-for-difficulty, avoid zero division */
        .orderByRaw(`("avgValue" + 1) / ("avgDifficulty" + 1) DESC`)
        .limit(limit)

    return courses;
}



export async function getTopCourses(limit: number = 10) {

    const courses = await knex.with("Base", (qb) => generateBaseCourseAverages(qb))
        .from("Base")
        .select("*")
        .where("Base.avgAgain", ">=", 0.7)
        .where("Base.avgRating", ">=", 7)
        .where("Base.avgValue", ">=", 7)
        .orderByRaw(`"avgRating" DESC`)
        .limit(limit)
        .join("Course", "Base.courseID", "Course.courseID")

    return courses;


}


export async function getTopInstructors(limit: number = 10) {

    const instructors = await knex.with("Base", (qb) => generateBaseInstructorAverages(qb))
        .from("Base")
        .select("*")
        .where("Base.avgInstructorAgain", ">=", 0.7)
        .where("Base.avgInstructorEffectiveness", ">=", 7)
        .where("Base.avgInstructorEnjoyed", ">=", 0.7)
        // .select([
        //     knex.raw(`(SELECT ((
        //          "avgInstructorEffectiveness" +
        //          "avgInstructorEnthusiasm" + 
        //          "avgInstructorAccommodationLevel" +                 
        //          (10.00 * "avgInstructorAgain") +
        //          (10.00 * "avgInstructorEnjoyed")
        //          ) 
        //          / 5.00) FROM "Base") 
        //          as "avgScore"`),
        // ])
        // .orderByRaw(`"avgScore" DESC`)
        // .limit(limit)
        .join("Instructor", "Base.instructorID", "Instructor.instructorID")
        .select(["Instructor.instructorID", "Instructor.name", "Instructor.email", "Instructor.departmentID", "Instructor.slug"])


    return instructors;


}


/**
 * Get top courses for a user based on the tags they have used in courses they liked
 * @param session The user's session
 * @param limit The max number of courses to return
 * @returns A list of such courses
 */
export async function getTopCoursesByTagAgg(session: CustomSession, limit: number = 10) {

    const courses = await knex.with("Base", (qb) => generateBaseCourseAverages(qb))
        .from("Base")
        .with("UserTags", (qb) => qb.from("Review")
            .where({
                "Review.deleted": false,
                "Review.archived": false,
                "Review.reviewerID": session.user.id
            })
            // .where("Review.rating", ">=", 6)
            //agg and count tags (each is an array of strings)
            .select([
                knex.raw(`array_agg("Review"."tags") as "tags"`),
                knex.raw(`count("Review"."tags") as "count"`),
                //if the user liked the course .where("Review.rating", ">=", 6), make the "liked" field true
                knex.raw(`bool_or("Review"."rating" >= 6) as "liked"`)
            ])
        )
        /* Now look for other courses with these tags */
        .with("TaggedCourses", (qb) => qb.from("Review")
            .where({
                "Review.deleted": false,
                "Review.archived": false
            })
            .select([
                knex.raw(`array_agg("Review"."tags") as "tags"`),
                knex.raw(`count("Review"."tags") as "count"`),
            ])
            //check if the course has the same tags as the user's liked courses
            // .whereIn("Review.tags", knex.raw(`(SELECT "UserTags"."tags" FROM "UserTags")`))

        )

        .limit(limit)
        .join("Course", "Base.courseID", "Course.courseID")

    console.log(courses);

    return courses;


}



// RULE: Select the top items from the department that the user has already reviewed.
export async function getTopDepartmentCourses(session: CustomSession, limit: number = 5) {

    if (!session.user) {
        return [];
    }

    const courses = await knex.with("Base", (qb) => generateBaseCourseAverages(qb))
        .from("Base")
        .limit(limit)
        .with("UserReviews", (qb) => qb.from("Review").where({
            "Review.deleted": false,
            "Review.archived": false,
            "Review.reviewerID": session.user.id
        }))
        .join("Course", "Base.courseID", "Course.courseID")
        .with("UserDepartments", (qb) =>
            qb.from("UserReviews")
                .join("Course", "UserReviews.courseID", "Course.courseID")
                .select("Course.departmentID"))
        // .join("Course", "Base.courseID", "Course.courseID")
        //this needs to be Base.departmentID (not Course.departmentID) (we need to get the avgs)
        .where("Course.departmentID", "in", knex.from("UserDepartments").select("UserDepartments.departmentID"))
        .andWhere("Course.courseID", "not in", knex.from("UserReviews").select("UserReviews.courseID"))
    // do ranking here
    // +min score check;


    console.log(courses);

    return courses;

}



