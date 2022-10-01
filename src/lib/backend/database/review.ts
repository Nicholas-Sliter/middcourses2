import knex from "./knex";
import { reviewInfo } from "./common";
import { public_instructor, public_review } from "../../common/types";


export async function voteReviewByID(reviewID: string, voteBy: string, voteType: string) {
    //check if the user has already voted on this review
    const hasVoted = await knex("Vote")
        .where({
            reviewID: reviewID,
            votedBy: voteBy
        })
        .first()
        .select("voteType");

    console.log("hasVoted", hasVoted);

    const voteTypeInt = voteType === "up" ? 1 : -1;
    let success: boolean = false;
    let removed: boolean = false;
    let value: -1 | 1 | null = null;

    try {

        if (!hasVoted) {
            //insert the vote
            await knex("Vote").insert({
                reviewID: reviewID,
                votedBy: voteBy,
                voteType: voteTypeInt
            });
            success = true;
            value = voteTypeInt;
        }

        // else we need to update the vote if the voteType is different
        // if the voteType is the same, we need to delete the vote
        else if (hasVoted.voteType !== voteTypeInt) {
            await knex("Vote")
                .where({
                    reviewID: reviewID,
                    votedBy: voteBy
                })
                .update({
                    voteType: voteTypeInt
                });
            value = voteTypeInt;
        }

        else {
            await knex("Vote")
                .where({
                    reviewID: reviewID,
                    votedBy: voteBy
                })
                .del();
            removed = true;
            value = null;
        }

        success = true;

    } catch (err) {
        console.log(err);
    }

    return { success, removed, value };

}


export async function getReviewByID(reviewID: string) {
}

export async function getReviewsByCourseIDs(courseIDs: string[]) {

}

export async function getReviewByCourseIDWithVotes(courseID: string, userID: string) {

    interface extended_public_review extends public_review {
        avgRating: number;
        avgDifficulty: number;
        avgHours: number;
        avgValue: number;
        avgAgain: number;
    }

    const query = await knex("Review")
        .where({
            courseID: courseID
        })
        .select(reviewInfo)
        .leftJoin("Vote", "Review.reviewID", "Vote.reviewID")
        .sum("Vote.voteType as voteCount")
        .groupBy(reviewInfo)
        //check if userID has voted on this review
        .select(
            knex.raw(`(SELECT "voteType" FROM "Vote" WHERE "Vote"."reviewID" = "Review"."reviewID" AND "Vote"."votedBy" = ?) as "userVoteType"`, [userID ?? null])
        )
        .orderBy("voteCount", "desc")
        //summarize all review info into averages
        .select(
            knex.raw(`(SELECT AVG("difficulty") FROM "Review" WHERE "Review"."courseID" = ?) as "avgDifficulty"`, [courseID]),
            knex.raw(`(SELECT AVG("hours") FROM "Review" WHERE "Review"."courseID" = ?) as "avgHours"`, [courseID]),
            knex.raw(`(SELECT AVG("again"::int::float4) FROM "Review" WHERE "Review"."courseID" = ?) as "avgAgain"`, [courseID]),
            knex.raw(`(SELECT AVG("value") FROM "Review" WHERE "Review"."courseID" = ?) as "avgValue"`, [courseID]),
            knex.raw(`(SELECT AVG("rating") FROM "Review" WHERE "Review"."courseID" = ?) as "avgRating"`, [courseID])

        ) as extended_public_review[]

    /**
     *         //get the average ratings for the course
    .avg("Review.rating as avgRating")
    .avg("Review.difficulty as avgDifficulty")
    .avg("Review.hours as avgHours")
    .avg("Review.value as avgValue")
    .avg("Review.again as avgAgain");
     */


    const output = query.map((review) => {
        return {
            "reviewID": review.reviewID,
            "courseID": review.courseID,
            "instructorID": review.instructorID,
            "semester": review.semester,
            "reviewDate": review.reviewDate,
            "content": review.content,
            "difficulty": review.difficulty,
            "value": review.value,
            "hours": review.hours,
            "again": review.again,
            "primaryComponent": review.primaryComponent,
            "tags": review.tags,
            "instructorEffectiveness": review.instructorEffectiveness,
            "instructorAccommodationLevel": review.instructorAccommodationLevel,
            "instructorEnthusiasm": review.instructorEnthusiasm,
            "instructorAgain": review.instructorAgain,
            "rating": review.rating,
            "avgRating": review.avgRating,
            "avgDifficulty": review.avgDifficulty,
            "avgHours": review.avgHours,
            "avgValue": review.avgValue,
            "avgAgain": review.avgAgain,
            votes: parseInt(review.voteCount ?? 0, 10),
            userVoteType: review?.userVoteType
        }
    });

    output.sort((a, b) => {
        return b.votes - a.votes;
    });

    return output as unknown as public_review[];
}