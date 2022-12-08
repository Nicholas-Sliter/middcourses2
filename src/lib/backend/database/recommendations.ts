
import knex from "./knex";
import { reviewInfo } from "./common";
import { CustomSession, public_instructor, public_review } from "../../common/types";
import { sortCoursesByTerm } from "../../common/utils";
import { Knex } from "knex";

const MAX_BASE_DATA_LIMIT = 5000;

// Drop "review.content" to reduce payload size
const recReviewInfo = [...reviewInfo
    .filter((column) => column !== "Review.content")
    , "Review.reviewerID"];


export async function getBaseRecommendationReviews(session: CustomSession, limit: number = MAX_BASE_DATA_LIMIT) {

    const { user } = session;

    if (!user || !user.authorized || user.role !== "student") {
        return [];
    }

    const reviews = {};

    const recentQuery = knex("Review")
        .select(recReviewInfo)
        .where({
            "Review.deleted": false,
            "Review.archived": false,
        })
        .orderBy("Review.reviewDate", "desc")
        .limit(limit);

    const userQuery = knex("Review")
        .select(recReviewInfo)
        .where({
            "Review.deleted": false,
            "Review.archived": false,
            "Review.reviewerID": user.id,
        });

    //await the two queries in parallel
    const [recentReviews, userReviews] = await Promise.all([
        await recentQuery,
        await userQuery,
    ]);

    recentReviews.forEach((review) => {
        reviews[review.reviewID] = review;
    });

    userReviews.forEach((review) => {
        reviews[review.reviewID] = review;
    });

    return Object.values(reviews);

    //need to also grab ALL of the reviews for the user (not just the ones in the limit) and merge them in (discarding duplicates)


}