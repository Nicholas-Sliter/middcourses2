import knex from "./knex";
import { reviewInfo } from "./common";
import { public_instructor, public_review } from "../../common/types";
import { parseStringToInt } from "../utils";


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
        voteCount: string;
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

        ) as extended_public_review[];

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
            votes: parseStringToInt(review.voteCount),
            userVoteType: review?.userVoteType
        }
    });

    output.sort((a, b) => {
        return b.votes - a.votes;
    });

    return output as unknown as public_review[];
}



export async function getReviewByInstructorIDWithVotes(instructorID: string, userID: string) {

    interface extended_public_review extends public_review {
        avgEffectiveness: number;
        avgAccommodationLevel: number;
        avgEnthusiasm: number;
        avgInstructorAgain: number;
        voteCount: string;
    }

    const query = await knex("Review")
        .where({
            instructorID: instructorID
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
            knex.raw(`(SELECT AVG("instructorEffectiveness") FROM "Review" WHERE "Review"."instructorID" = ?) as "avgEffectiveness"`, [instructorID]),
            knex.raw(`(SELECT AVG("instructorAccommodationLevel") FROM "Review" WHERE "Review"."instructorID" = ?) as "avgAccommodationLevel"`, [instructorID]),
            knex.raw(`(SELECT AVG("instructorEnthusiasm") FROM "Review" WHERE "Review"."instructorID" = ?) as "avgEnthusiasm"`, [instructorID]),
            knex.raw(`(SELECT AVG("instructorAgain"::int::float4) FROM "Review" WHERE "Review"."instructorID" = ?) as "avgInstructorAgain"`, [instructorID])

        ) as extended_public_review[];

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
            "avgEffectiveness": review.avgEffectiveness,
            "avgAccommodationLevel": review.avgAccommodationLevel,
            "avgEnthusiasm": review.avgEnthusiasm,
            "avgInstructorAgain": review.avgInstructorAgain,
            votes: parseStringToInt(review.voteCount),
            userVoteType: review?.userVoteType
        }
    });

    //sort by reviewDate
    output.sort((a, b) => {
        return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime();
    });

    return output as unknown as public_review[];
}





export async function getReviewByInstructorSlugWithVotes(slug: string, userID: string) {

    interface extended_public_review extends public_review {
        avgEffectiveness: number;
        avgAccommodationLevel: number;
        avgEnthusiasm: number;
        avgInstructorAgain: number;
        voteCount: string;
    }

    const query = await knex("Instructor")
        .where({
            slug: slug
        })
        .select("Instructor.instructorID")
        .join("Review", "Instructor.instructorID", "Review.instructorID")
        .select(reviewInfo)
        .leftJoin("Vote", "Review.reviewID", "Vote.reviewID")
        .sum("Vote.voteType as voteCount")
        .groupBy(reviewInfo)
        .groupBy("Instructor.instructorID")
        //check if userID has voted on this review
        .select(
            knex.raw(`(SELECT "voteType" FROM "Vote" WHERE "Vote"."reviewID" = "Review"."reviewID" AND "Vote"."votedBy" = ?) as "userVoteType"`, [userID ?? null])
        )
        .orderBy("voteCount", "desc")
        //summarize all review info into averages
        .select(
            knex.raw(`(SELECT AVG("instructorEffectiveness") FROM "Review" WHERE "Review"."instructorID" = "Instructor"."instructorID") as "avgEffectiveness"`),
            knex.raw(`(SELECT AVG("instructorAccommodationLevel") FROM "Review" WHERE "Review"."instructorID" = "Instructor"."instructorID") as "avgAccommodationLevel"`),
            knex.raw(`(SELECT AVG("instructorEnthusiasm") FROM "Review" WHERE "Review"."instructorID" = "Instructor"."instructorID") as "avgEnthusiasm"`),
            knex.raw(`(SELECT AVG("instructorAgain"::int::float4) FROM "Review" WHERE "Review"."instructorID" = "Instructor"."instructorID") as "avgInstructorAgain"`)

        ) as extended_public_review[];

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
            "avgEffectiveness": review.avgEffectiveness,
            "avgAccommodationLevel": review.avgAccommodationLevel,
            "avgEnthusiasm": review.avgEnthusiasm,
            "avgInstructorAgain": review.avgInstructorAgain,
            votes: parseStringToInt(review.voteCount),
            userVoteType: review?.userVoteType
        }
    });

    //sort by reviewDate
    output.sort((a, b) => {
        return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime();
    });

    return output as unknown as extended_public_review[];
}