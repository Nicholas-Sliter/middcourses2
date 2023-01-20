import knex from "./knex";
import { Knex } from "knex";



/**
 * Get all the course codes that refer to a given course.
 */
export async function getCourseCodes(courseID: string) {
    const codes = await knex("Alias")
        .select("aliasID", "courseID")
        .where("courseID", courseID)
        .union(
            knex("Alias")
                .select("aliasID", "courseID")
                .where("aliasID", courseID)
        )
        .distinct();

    const codeSet = new Set<string>();
    codeSet.add(courseID);

    for (const code of codes) {
        codeSet.add(code.aliasID);
        codeSet.add(code.courseID);
    }

    return Array.from(codeSet);

}


/**
 * Return a CTE that can be used to get all the course codes that refer to a given course.
 * @param courseID 
 */
export async function getCourseCodesCTE(qb: Knex.QueryBuilder, courseID: string) {

    return qb
        .with("aggregate", (qb) => {
            qb.from("Alias")
                .select("aliasID", "courseID")
                .where("courseID", courseID)
                .union(
                    knex("Alias")
                        .select("aliasID", "courseID")
                        .where("aliasID", courseID)
                )
        })
        .from("aggregate")
        .select(knex.raw("DISTINCT(UNNEST(ARRAY_AGG(? || ?? || ??))) as codes", [courseID, "aliasID", "courseID"]));
}