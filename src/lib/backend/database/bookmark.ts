import knex from "./knex";
import { reviewInfo } from "./common";
import { CustomSession, full_review, public_instructor, public_review } from "../../common/types";
import { Knex } from "knex";
import { parseStringToInt } from "../utils";
import { parseMaybeInt } from "../../common/utils";
import { getCourseCodes, getCourseCodesQuery } from "./alias";


const MAX_USER_BOOKMARKS = 256;

/** Bookmark or unbookmark a course for a user.
 * 
 * @param session 
 * @param courseID 
 * @param remove
 * @returns 
 */
export async function bookmarkCourse(session: CustomSession, courseID: string, remove: boolean = false): Promise<{
    success: boolean,
    message: string
}> {
    if (!session.user) {
        return {
            success: false,
            message: "You must be logged in to bookmark a course."
        };
    }

    const { count: userBookmarkCount } = await knex("Bookmark")
        .where({ userID: session.user.id })
        .count("*", { as: "count" })
        .first();


    if (userBookmarkCount && parseMaybeInt(userBookmarkCount) >= MAX_USER_BOOKMARKS) {
        console.log(`User ${session.user.id} has reached the maximum number of bookmarks (${MAX_USER_BOOKMARKS})`);
        return {
            success: false,
            message: `You have reached the maximum number of bookmarks (${MAX_USER_BOOKMARKS}).`
        };
    }

    const codes = await getCourseCodes(courseID);

    if (remove) {
        /* remove bookmark */
        const deleted = await knex("Bookmark")
            .where({ userID: session.user.id })
            .andWhere((builder: Knex.QueryBuilder) => {
                builder.whereIn("courseID", codes);
            })
            .del();

        return {
            success: deleted > 0,
            message: deleted > 0 ? "Bookmark removed." : "Bookmark not found."
        };
    }

    /* remove existing bookmark */
    const deleted = await knex("Bookmark")
        .where({ userID: session.user.id })
        .andWhere((builder: Knex.QueryBuilder) => {
            builder.whereIn("courseID", codes);
        })
        .del();

    /* insert new bookmark */
    await knex("Bookmark")
        .insert({
            userID: session.user.id,
            courseID: courseID
        })

    return {
        success: true,
        message: "Bookmark added."
    };

}


export async function isBookmarked(session: CustomSession, courseID: string): Promise<boolean> {
    if (!session?.user) {
        return false;
    }

    const codes = await getCourseCodes(courseID);

    const bookmark = await knex("Bookmark")
        .where({ userID: session.user.id })
        .andWhere((builder: Knex.QueryBuilder) => {
            builder.whereIn("courseID", codes);
        })
        .first();

    return !!bookmark;
}


export async function getAllUserBookmarks(session: CustomSession): Promise<number[]> {
    if (!session.user) {
        return [];
    }

    const bookmarks = await knex("Bookmark")
        .where({ userID: session.user.id })
        .select("courseID");

    return bookmarks.map((bookmark) => bookmark.courseID);

}


export async function getAllBookmarksInSemester(session: CustomSession, semester: string): Promise<number[]> {
    if (!session.user) {
        return [];
    }

    const bookmarks = await knex("Bookmark")
        .where({ userID: session.user.id })
        .leftJoin("CatalogCourse", "CatalogCourse.courseID", "Bookmark.courseID")
        .where("CatalogCourse.semester", semester)
        .select("Bookmark.courseID")
        .orderBy("Bookmark.courseID", "asc")
        .distinct();

    return bookmarks.map((bookmark) => bookmark.courseID);

}







