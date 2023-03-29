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


// export function getCourseCodesQuery(courseID: string) {
//     return knex.raw(`
//     WITH "codes" AS (    
//     (SELECT "Alias"."aliasID" FROM "Alias" WHERE "Alias"."courseID" = ?) 
//         UNION ALL
//         (SELECT "Alias"."courseID" FROM "Alias" WHERE "Alias"."aliasID" = ?)
//         UNION ALL
//         (SELECT ?)
//     ) SELECT DISTINCT(ARRAY_AGG("codes"."aliasID")) FROM "codes" LIMIT 1
//     `, [courseID, courseID, courseID])
// }

export function getCourseCodesQuery(courseID: string) {
    //     return knex.from("Alias")
    //         .where("courseID", courseID)
    //         .orWhere("aliasID", courseID)
    //         .select(knex.raw(`DISTINCT(ARRAY_AGG("Alias"."aliasID"))`))
    // }

    // return knex.from("Alias")
    //     .where("courseID", courseID)
    //     .select(knex.raw(`DISTINCT(ARRAY_AGG("Alias"."aliasID"))`))
    //     .union(
    //         knex.from("Alias")
    //             .where("aliasID", courseID)
    //             .select(knex.raw(`DISTINCT(ARRAY_AGG("Alias"."courseID"))`))
    //     )

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


export async function upsertAliases(transaction: Knex.Transaction, aliases: { aliasID: string, courseID: string, term: string }[]) {

    const uniqueAliases = new Map<string, { aliasID: string, courseID: string, term: string }>();
    for (const alias of aliases) {
        const key = `${alias.aliasID} - ${alias.courseID} - ${alias.term}`;
        uniqueAliases.set(key, alias);
    }

    const aliasList = Array.from(uniqueAliases.values());


    /**
     * So occasionally, the aliases listed in the catalog are not valid courses.
     * From a foregin key perspective, this is bad and will cause the transaction to fail.
     * To get around this we check courseIDs first
     * EX: Invalid alias: CMLT0286 - PHIL0286 - F22
     */

    const courseIDs = await transaction("Course")
        .select("courseID")
        .distinct();

    const courseIDSet = new Set<string>();
    for (const courseID of courseIDs) {
        courseIDSet.add(courseID.courseID);
    }

    const aliasesToInsert = [];
    for (const alias of aliasList) {
        if (courseIDSet.has(alias.courseID) && courseIDSet.has(alias.aliasID)) {
            aliasesToInsert.push(alias);
            continue;
        }
        console.log(`Invalid alias: ${alias.aliasID} - ${alias.courseID} - ${alias.term}`)
    }


    await transaction("Alias")
        .insert(aliasesToInsert)
        .onConflict(["aliasID", "courseID", "term"])
        .ignore();

    return;
}


export async function reconileAliases(transaction: Knex.Transaction, aliases: { aliasID: string, courseID: string, term: string }[], semester: string) {
    const aliasTerm = aliases[0].term ?? undefined;
    if (!aliasTerm) {
        return;
    }

    if (aliasTerm !== semester) {
        throw new Error("Term mismatch");
    }

    const termAliases = await transaction("Alias")
        .select("aliasID", "courseID")
        .where("term", semester);

    const aliasSet = new Set<string>();
    for (const alias of termAliases) {
        const key = `${alias.aliasID} - ${alias.courseID}`;
        aliasSet.add(key);
    }

    const aliasesToDelete = [];
    for (const alias of aliases) {
        const key = `${alias.aliasID} - ${alias.courseID}`;
        if (!aliasSet.has(key)) {
            aliasesToDelete.push(alias);
        }
    }

    if (aliasesToDelete.length > 0) {
        await transaction("Alias")
            .whereIn("aliasID", aliasesToDelete.map((alias) => alias.aliasID))
            .whereIn("courseID", aliasesToDelete.map((alias) => alias.courseID))
            .where("term", semester)
            .del();
    }

    return;
}


export async function isCourseAnAliasForCourse(courseID: string, aliasID: string) {
    const codes = await getCourseCodes(courseID);
    return codes.includes(aliasID);
}