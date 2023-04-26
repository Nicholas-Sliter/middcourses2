import knex from "./knex";
import { reviewInfo } from "./common";
import { CustomSession, full_review, public_instructor, public_review } from "../../common/types";
import { parseStringToInt } from "../utils";
import { Knex } from "knex";
import { insertBackups } from "./backups";
import { getCourseCodes } from "./alias";


export async function voteReviewByID(reviewID: string, voteBy: string, voteType: string) {
    //check if the user has already voted on this review
    const hasVoted = await knex("Vote")
        .where({
            reviewID: reviewID,
            votedBy: voteBy
        })
        .first()
        .select("voteType");

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


export async function getTransactionReviewCount(transaction: Knex.Transaction) {

    return await transaction("Review")
        .count("reviewID as count")
        .first() as { count: number };

}


/**
 * Reconcile reviews with data now inconsistent due to the deletion of a CourseInstructor
 * This function should theoretically never delete a review due to other checks in place
 * 
 * @WARNING This function **will delete reviews**
 * 
 * 
 */
export async function reconcileReviews(transaction: Knex.Transaction, semester: string, ignoreWarnings: boolean = false) {

    const reviews = await transaction("Review")
        .where("semester", semester)
        .select(["reviewID", "courseID", "instructorID"]);

    const courseIDs = reviews.map((r) => r.courseID);
    const instructorIDs = reviews.map((r) => r.instructorID);

    const courseInstructors = await transaction("CourseInstructor")
        .whereIn("courseID", courseIDs)
        .whereIn("instructorID", instructorIDs)
        .where("term", semester)
        .select(["courseID", "instructorID", "term"]);

    const courseInstructorMap = new Map<string, string[]>();
    courseInstructors.forEach((ci) => {
        const key = `${ci.courseID}|${ci.instructorID}`;
        if (!courseInstructorMap.has(key)) {
            courseInstructorMap.set(key, []);
        }
        courseInstructorMap.get(key)?.push(ci.term);
    });

    const reviewsToDelete: string[] = [];
    reviews.forEach((r) => {
        const key = `${r.courseID}|${r.instructorID}`;
        if (!courseInstructorMap.has(key)) {
            reviewsToDelete.push(r.reviewID);
        }
        else {
            const terms = courseInstructorMap.get(key);
            if (!terms?.includes(semester)) {
                reviewsToDelete.push(r.reviewID);
            }
        }
    });

    if (reviewsToDelete.length > 0) {
        console.warn(`Attempting to delete ${reviewsToDelete.length} reviews`);
        console.log("This is likely due to a CourseInstructor being deleted");

        if (!ignoreWarnings) {
            throw new Error("Operation would delete reviews");
        }
    }

    if (reviewsToDelete.length > 0) {
        console.log(`Deleting ${reviewsToDelete.length} reviews`);
        await transaction("Review")
            .whereIn("reviewID", reviewsToDelete)
            .del();
    }
    else {
        console.log("No reviews to delete");
    }

}


export async function backupReviews() {

    try {
        const reviews = await knex("Review")
            .select("*");

        const reviewBackups = [];
        reviews.forEach((r) => {
            const key = `Review-${r.reviewID}`;
            const value = JSON.stringify(r);
            const date = new Date().toISOString();
            reviewBackups.push({ key, value, created_at: date });
        });

        await insertBackups(reviewBackups);
    } catch (err) {
        console.log(err);
    }

}


export async function flagReviewByID(reviewID: string, flagReason: string, session: CustomSession) {
    const user = session?.user;
    if (!user) {
        return { success: false, error: "Not logged in" };
    }

    const review = await knex("Review")
        .where("reviewID", reviewID)
        .first();

    if (!review) {
        return { success: false, error: "Review does not exist" };
    }

    const flag = await knex("Flagged")
        .where({
            reviewID: reviewID,
            flaggedBy: user.id
        })
        .first();

    if (flag) {
        return { success: false, error: "Already flagged" };
    }

    try {
        await knex("Flagged").insert({
            reviewID: reviewID,
            flaggedBy: user.id,
            reason: flagReason,
            flaggedDate: new Date().toISOString()
        });
        return { success: true };
    }
    catch (err) {
        console.error(err);
        return { success: false, error: "Failed to flag review" };
    }

}


export async function __getAllFullReviews() {
    const reviews = await knex("Review")
        .select("*");

    return reviews;
}


export async function getReviewByID(reviewID: string) {
    const review = await knex("Review")
        .where({
            reviewID: reviewID
        })
        .first()
        .select(reviewInfo);

    return review as public_review;
}

export async function __getFullReviewByID(reviewID: string) {
    const review = await knex("Review")
        .where({
            reviewID: reviewID
        })
        .first()
        .select("*");

    return review as full_review;
}


export async function __insertReview(review: full_review) {
    const reviewID = await knex("Review").insert(review);
    return reviewID;
}


export async function deleteReviewByID(reviewID: string, permanent: boolean = false) {
    if (permanent) {
        await knex("Review")
            .where({
                reviewID: reviewID
            })
            .del();
        console.log(`Deleted review ${reviewID} permanently`);
    }
    else {
        //set deleted boolean to true
        await knex("Review")
            .where({
                reviewID: reviewID
            })
            .update({
                deleted: true
            });
        console.log(`Deleted review ${reviewID} temporarily`);
    }

    return;
}


export async function getReviewsByUserID(userID: string) {
    const reviews = await knex("Review")
        .where({
            reviewerID: userID
        })
        .leftJoin("Instructor", "Review.instructorID", "Instructor.instructorID")
        .select("Instructor.name as instructorName", "Instructor.instructorID", "Instructor.slug as instructorSlug")
        .select(reviewInfo) as public_review[];

    return reviews;
}


export async function hasUserReviewedCourseOrAlias(userID: string, courseID: string) {
    const courseCodes = await getCourseCodes(courseID);
    const reviews = await knex("Review")
        .where({
            reviewerID: userID
        })
        .whereIn("courseID", courseCodes)
        .select("reviewID");

    return reviews.length > 0;
}


export async function getReviewsByInstructorEmail(email: string) {
    const reviews = await knex("Instructor")
        .where({
            email: email,
        })
        .leftJoin("Review", "Instructor.instructorID", "Review.instructorID")
        .select(reviewInfo) as public_review[];

    return reviews;
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
    const courseReviewInfo = reviewInfo.map((r) => `CourseReviews.${r.split(".")[1]}`);

    const codes = await getCourseCodes(courseID); // Weird errors if we attempt to do this in the query

    const query = await knex("Review")
        .with("CourseReviews", async (qb) => {
            qb.select(reviewInfo)
                .from("Review")
                .where({
                    deleted: false,
                    archived: false
                })
                .andWhere("Review.courseID", "in", codes)
        })
        .with("CourseReviewsAverages", async (qb) => {
            qb.from("CourseReviews")
                .avg({
                    'avgRating': 'rating',
                    'avgValue': 'value',
                    'avgDifficulty': 'difficulty',
                    'avgHours': 'hours',
                    'avgAgain': knex.raw(`"again"::int::float4`)
                })
        })
        .with("CourseReviewsVotes", async (qb) => {
            qb.from("CourseReviews")
                .leftJoin("Vote", "CourseReviews.reviewID", "Vote.reviewID")
                .groupBy("CourseReviews.reviewID")
                .sum("Vote.voteType as voteCount")
                .select(
                    "CourseReviews.reviewID",
                )
                .select(
                    knex.raw(`(SELECT "voteType" FROM "Vote" WHERE "Vote"."reviewID" = "CourseReviews"."reviewID" AND "Vote"."votedBy" = ?) as "userVoteType"`, [userID ?? null])
                )
        })
        .from("CourseReviews")
        .select(courseReviewInfo)
        .joinRaw("LEFT JOIN LATERAL (SELECT * FROM \"CourseReviewsAverages\" WHERE TRUE) AS \"CourseReviewsAverages\" ON TRUE")
        .leftJoin("CourseReviewsVotes", "CourseReviews.reviewID", "CourseReviewsVotes.reviewID")

        .select(
            [
                "CourseReviewsAverages.avgRating",
                "CourseReviewsAverages.avgValue",
                "CourseReviewsAverages.avgDifficulty",
                "CourseReviewsAverages.avgHours",
                "CourseReviewsAverages.avgAgain",
                "CourseReviewsVotes.voteCount",
                "CourseReviewsVotes.userVoteType"
            ]
        )
        .orderBy("CourseReviewsVotes.voteCount", "desc") as extended_public_review[];


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
            "instructorEnjoyed": review.instructorEnjoyed,
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
            knex.raw(`(SELECT AVG("instructorAgain":: int:: float4) FROM "Review" WHERE "Review"."instructorID" = ?) as "avgInstructorAgain"`, [instructorID])

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
            "instructorEnjoyed": review.instructorEnjoyed,
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
        avgInstructorEnjoyed: number;
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
        //summarize all review info into averages
        .select(
            knex.raw(`(SELECT AVG("instructorEffectiveness") FROM "Review" WHERE "Review"."instructorID" = "Instructor"."instructorID") as "avgEffectiveness"`),
            knex.raw(`(SELECT AVG("instructorAccommodationLevel") FROM "Review" WHERE "Review"."instructorID" = "Instructor"."instructorID") as "avgAccommodationLevel"`),
            knex.raw(`(SELECT AVG("instructorEnthusiasm") FROM "Review" WHERE "Review"."instructorID" = "Instructor"."instructorID") as "avgEnthusiasm"`),
            knex.raw(`(SELECT AVG("instructorAgain":: int:: float4) FROM "Review" WHERE "Review"."instructorID" = "Instructor"."instructorID") as "avgInstructorAgain"`),
            knex.raw(`(SELECT AVG("instructorEnjoyed":: int:: float4) FROM "Review" WHERE "Review"."instructorID" = "Instructor"."instructorID") as "avgInstructorEnjoyed"`),

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
            "instructorEnjoyed": review.instructorEnjoyed,
            "rating": review.rating,
            "avgEffectiveness": review.avgEffectiveness,
            "avgAccommodationLevel": review.avgAccommodationLevel,
            "avgEnthusiasm": review.avgEnthusiasm,
            "avgInstructorAgain": review.avgInstructorAgain,
            "avgInstructorEnjoyed": review.avgInstructorEnjoyed,
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


export async function getReviewsByDepartmentID(departmentID: string) {

    interface extended_public_review extends public_review {
        avgEffectiveness: number | string | null;
        avgAccommodationLevel: number | string | null;
        avgEnthusiasm: number | string | null;
        avgInstructorAgain: number | string | null;
        avgInstructorEnjoyed: number | string | null;
        avgDifficulty: number | string | null;
        avgValue: number | string | null;
        avgHours: number | string | null;
        avgRating: number | string | null;
        avgAgain: number | string | null;
    }


    const deptReviewInfo = reviewInfo.map((info) => {
        return `deptReviews.${info.split(".")[1]} `;
    });

    const query = await knex.with("deptReviews", (qb) => {
        qb.from("Course")
            .where({ "Course.departmentID": departmentID })
            .join("Review", "Course.courseID", "Review.courseID")
            .where({ "Review.deleted": false })
            .select(reviewInfo)
    })
        .from("deptReviews")
        .select(deptReviewInfo)
        .groupBy(deptReviewInfo)
        //summarize all review info into averages
        .select(
            knex.raw(`(SELECT AVG("instructorEffectiveness") FROM "deptReviews") as "avgEffectiveness"`),
            knex.raw(`(SELECT AVG("instructorAccommodationLevel") FROM "deptReviews") as "avgAccommodationLevel"`),
            knex.raw(`(SELECT AVG("instructorEnthusiasm") FROM "deptReviews") as "avgEnthusiasm"`),
            knex.raw(`(SELECT AVG(CAST("instructorAgain" = 'True' as int)) FROM "deptReviews") as "avgInstructorAgain"`),
            knex.raw(`(SELECT AVG(CAST("instructorEnjoyed" = 'True' as int)) FROM "deptReviews") as "avgInstructorEnjoyed"`),
            knex.raw(`(SELECT AVG("difficulty") FROM "deptReviews") as "avgDifficulty"`),
            knex.raw(`(SELECT AVG("hours") FROM "deptReviews") as "avgHours"`),
            knex.raw(`(SELECT AVG(CAST("again" = 'True' as int)) FROM "deptReviews") as "avgAgain"`),
            knex.raw(`(SELECT AVG("value") FROM "deptReviews") as "avgValue"`),
            knex.raw(`(SELECT AVG("rating") FROM "deptReviews") as "avgRating"`)

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
            "instructorEnjoyed": review.instructorEnjoyed,
            "rating": review.rating,
            "avgEffectiveness": review.avgEffectiveness,
            "avgAccommodationLevel": review.avgAccommodationLevel,
            "avgEnthusiasm": review.avgEnthusiasm,
            "avgInstructorAgain": review.avgInstructorAgain,
            "avgInstructorEnjoyed": review.avgInstructorEnjoyed,
            "avgDifficulty": review.avgDifficulty,
            "avgValue": review.avgValue,
            "avgHours": review.avgHours,
            "avgRating": review.avgRating,
            "avgAgain": review.avgAgain,
        }
    });

    //sort by reviewDate
    output.sort((a, b) => {
        return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime();
    });

    return output as unknown as extended_public_review[];
}



export async function getNRandomUnvotedReviews(session: CustomSession, num: number) {

    if (!session?.user || !session.user.authorized) {
        return [];
    }

    const unvotedReviews = await knex("Review")
        .where({ "Review.deleted": false })
        .whereNotIn("Review.reviewID", function () {
            this.select("reviewID").from("Vote").where({ "Vote.votedBy": session.user.id });
        }
        )
        .select(reviewInfo)
        .orderByRaw("RANDOM()")
        .limit(num);


    return JSON.parse(JSON.stringify(unvotedReviews));

}



export async function getAllUserVotedReviews(session: CustomSession) {

    if (!session?.user) {
        return [];
    }

    const votedReviews = await knex("Vote")
        .where({ "Vote.votedBy": session.user.id })
        .join("Review", "Vote.reviewID", "Review.reviewID")
        .where({ "Review.deleted": false })
        .select(reviewInfo)
        .groupBy(reviewInfo)
        .select(
            knex.raw(`(SELECT "voteType" FROM "Vote" WHERE "Vote"."reviewID" = "Review"."reviewID" AND "Vote"."votedBy" = ?) as "userVoteType"`, [session.user.id ?? null])
        )
        .orderBy("Review.reviewDate", "desc");

    return JSON.parse(JSON.stringify(votedReviews));


}