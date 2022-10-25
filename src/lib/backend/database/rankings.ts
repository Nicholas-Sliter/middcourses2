import knex from "./knex";
import { reviewInfo } from "./common";
import { CustomSession, public_instructor, public_review } from "../../common/types";
import { sortCoursesByTerm } from "../../common/utils";
import { Knex } from "knex";

/**
 * Rule-based recommendations
 * 
 */



// LET's do a buider pattern where the base avg query is already complete, then we can add on to it


export function generateBaseCourseAverages(qb: Knex.QueryBuilder) {
    //return a knex query builder (run with no await)
    // return knex("Review")
    // .with("courseAverages", function () {
    //     this.from("Review")
    //         .where({
    //             "Review.deleted": false,
    //             "Review.archived": false
    //         })
    //         .groupBy("Review.courseID")
    //         .havingRaw(`count("Review"."courseID") >= 3`)
    //         .select([
    //             knex.raw(`(SELECT AVG("difficulty") FROM "Review") as "avgDifficulty"`),
    //             knex.raw(`(SELECT AVG("hours") FROM "Review") as "avgHours"`),
    //             knex.raw(`(SELECT AVG("again"::int::float4) FROM "Review") as "avgAgain"`),
    //             knex.raw(`(SELECT AVG("rating") FROM "Review") as "avgRating"`),
    //             knex.raw(`(SELECT AVG("value") FROM "Review") as "avgValue"`),
    //             knex.raw(`(SELECT AVG("instructorEffectiveness") FROM "Review") as "avgInstructorEffectiveness"`),
    //             knex.raw(`(SELECT AVG("instructorAccommodationLevel") FROM "Review") as "avgInstructorAccommodationLevel"`),
    //             knex.raw(`(SELECT AVG("instructorEnthusiasm") FROM "Review") as "avgInstructorEnthusiasm"`),
    //             knex.raw(`(SELECT AVG("instructorAgain"::int::float4) FROM "Review") as "avgInstructorAgain"`),
    //             knex.raw(`(SELECT AVG("instructorEnjoyed"::int::float4) FROM "Review") as "avgInstructorEnjoyed"`),
    //         ])
    // })
    // .as("baseCourseAverages");




    // .where({
    //     "Review.deleted": false,
    //     "Review.archived": false
    // })
    // .groupBy("Review.courseID")
    // /* ensure that the course has at least 3 reviews */
    // .havingRaw(`count("Review"."courseID") >= 3`)
    // .select([
    //     knex.raw(`(SELECT AVG("difficulty") FROM "Review") as "avgDifficulty"`),
    //     knex.raw(`(SELECT AVG("hours") FROM "Review") as "avgHours"`),
    //     knex.raw(`(SELECT AVG("again"::int::float4) FROM "Review") as "avgAgain"`),
    //     knex.raw(`(SELECT AVG("rating") FROM "Review") as "avgRating"`),
    //     knex.raw(`(SELECT AVG("value") FROM "Review") as "avgValue"`),
    //     knex.raw(`(SELECT AVG("instructorEffectiveness") FROM "Review") as "avgInstructorEffectiveness"`),
    //     knex.raw(`(SELECT AVG("instructorAccommodationLevel") FROM "Review") as "avgInstructorAccommodationLevel"`),
    //     knex.raw(`(SELECT AVG("instructorEnthusiasm") FROM "Review") as "avgInstructorEnthusiasm"`),
    //     knex.raw(`(SELECT AVG("instructorAgain"::int::float4) FROM "Review") as "avgInstructorAgain"`),
    //     knex.raw(`(SELECT AVG("instructorEnjoyed"::int::float4) FROM "Review") as "avgInstructorEnjoyed"`),
    // ])
    // .select("Review.courseID")
    // .as("courseAverages");

    return qb.from("Review").where({
        "Review.deleted": false,
        "Review.archived": false
    })
        .groupBy(["Review.courseID"])
        .havingRaw(`count("Review"."courseID") >= 3`)
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



/**
 * Get the top value-for-difficulty courses
 * @param limit The max number of courses to return
 * @returns A list of such courses
 */

export async function getTopValueForDifficultyCourses(limit: number): Promise<public_instructor[]> {
    //get the base query
    // const baseQuery = generateBaseCourseAverages();

    // console.log(await baseQuery);

    // const courses = await (baseQuery
    //     .andHaving("avgDifficulty", "<=", 5)
    //     .andHaving("avgValue", ">=", 7)
    //     /* sort by value-for-difficulty, avoid zero division */
    //     .orderByRaw(`("avgValue" + 1) / ("avgDifficulty" + 1) DESC`)
    //     .limit(limit))

    // const courses = await knex
    //     .from(baseQuery)
    //     .having("avgDifficulty", "<=", 5)
    //     .having("avgValue", ">=", 7)
    //     /* sort by value-for-difficulty, avoid zero division */
    //     .orderByRaw(`("avgValue" + 1) / ("avgDifficulty" + 1) DESC`)
    //     .limit(limit)


    // const courses = await knex.with("baseCourseAverages", baseQuery)
    //     .as("baseCourseAverages")
    //     .from("baseCourseAverages")
    //     .groupBy(["courseID", "baseCourseAverages.avgDifficulty", "baseCourseAverages.avgValue", "baseCourseAverages.avgAgain", "baseCourseAverages.avgRating", "baseCourseAverages.avgHours", "baseCourseAverages.avgInstructorEffectiveness", "baseCourseAverages.avgInstructorAccommodationLevel", "baseCourseAverages.avgInstructorEnthusiasm", "baseCourseAverages.avgInstructorAgain", "baseCourseAverages.avgInstructorEnjoyed"])

    //     .having("baseCourseAverages.avgDifficulty", "<=", 5)
    //     .having("baseCourseAverages.avgValue", ">=", 7)
    //     /* sort by value-for-difficulty, avoid zero division */
    //     .orderByRaw(`("avgValue" + 1) / ("avgDifficulty" + 1) DESC`)
    //     .limit(limit)


    const courses = await knex.with("Base", (qb) => generateBaseCourseAverages(qb))
        .from("Base")
        .select("*")
        .where("Base.avgDifficulty", "<=", 5)
        .where("Base.avgValue", ">=", 7)
        /* sort by value-for-difficulty, avoid zero division */
        .orderByRaw(`("avgValue" + 1) / ("avgDifficulty" + 1) DESC`)
        .limit(limit)






    console.log(courses);

    return courses;
}