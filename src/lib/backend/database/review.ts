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
            knex.raw(`(SELECT "voteType" FROM "Vote" WHERE "Vote"."reviewID" = "Review"."reviewID" AND "Vote"."votedBy" = ?) as "userVoteType"`, [userID])
        )

    //breaks if user has not voted on reivew

    //how to combind with the user's vote?

    console.log(query);
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
            "instructorEffectiveness": review.instructorEffectiveness,
            "instructorAccommodationLevel": review.instructorAccommodationLevel,
            "instructorEnthusiasm": review.instructorEnthusiasm,
            "instructorAgain": review.instructorAgain,
            "rating": review.rating,
            votes: parseInt(review.voteCount ?? 0, 10),
            userVoteType: review?.userVoteType
        }
    });

    return output as unknown as public_review[];
}