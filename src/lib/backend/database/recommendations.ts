
import knex from "./knex";
import { reviewInfo } from "./common";
import { CustomSession, public_instructor, public_review } from "../../common/types";
import { sortCoursesByTerm } from "../../common/utils";
import { Knex } from "knex";

const MAX_BASE_DATA_LIMIT = 5000;

// Drop "review.content" to reduce payload size
const recReviewInfo = reviewInfo
    .filter((column) => column !== "Review.content")
    .push("Review.reviewerID");


export async function getBaseRecommendationReviews(session: CustomSession, limit: number = MAX_BASE_DATA_LIMIT) {

    const { user } = session;

    if (!user || !user.authorized || user.role !== "student") {
        return [];
    }

    const reviews = [];

    const recentReviews = knex("Review")
        .select(recReviewInfo)
        .where({
            "Review.deleted": false,
            "Review.archived": false,
        })
        .limit(limit);

    const userReviews = knex("Review")
        .select(recReviewInfo)
        .where({
            "Review.deleted": false,
            "Review.archived": false,
            "Review.reviewerID": user.id,
        });

    //await the two queries in parallel
    const [recentReviewsResult, userReviewsResult] = await Promise.all([
        recentReviews,
        userReviews,
    ]);

    //merge the two results together
    const userReviewsSet = new Set(userReviewsResult.map((review) => review.id));

    //add the user reviews first
    for (const review of userReviewsResult) {
        reviews.push(review);
    }

    //add the recent reviews
    for (const review of recentReviewsResult) {
        if (!userReviewsSet.has(review.id)) {
            reviews.push(review);
        }
    }

    return reviews;

    //need to also grab ALL of the reviews for the user (not just the ones in the limit) and merge them in (discarding duplicates)


}