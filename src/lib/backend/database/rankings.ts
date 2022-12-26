import knex from "./knex";
import { reviewInfo } from "./common";
import { CustomSession, public_instructor, public_review } from "../../common/types";
import { sortCoursesByTerm } from "../../common/utils";
import { Knex } from "knex";

/**
 * Rule-based recommendations
 * 
 */

interface CourseAverages {
    courseID: string;
    avgRating: number;
    avgValue: number;
    avgDifficulty: number;
    avgHours: number;
    avgAgain: number;

    avgInstructorEffectiveness: number;
    avgInstructorAccommodationLevel: number;
    avgInstructorEnthusiasm: number;
    avgInstructorAgain: number;
    avgInstructorEnjoyed: number;

    numReviews: number;
}



export function generateBaseCourseAverages(qb: Knex.QueryBuilder, count: number = 3) {

    return qb.with("CourseReview", (qb) => {
        qb.from("Review")
            .where(
                {
                    "Review.deleted": false,
                    "Review.archived": false
                })
            .select(reviewInfo)
    })
        .from("CourseReview")
        .groupBy(["CourseReview.courseID"])
        .havingRaw(`count("CourseReview"."courseID") >= ?`, [count])
        .select(["CourseReview.courseID"])
        .avg({
            /* Instructor specific */
            avgInstructorEffectiveness: "CourseReview.instructorEffectiveness",
            avgInstructorAccommodationLevel: "CourseReview.instructorAccommodationLevel",
            avgInstructorEnthusiasm: "CourseReview.instructorEnthusiasm",
            avgInstructorAgain: knex.raw(`CAST("CourseReview"."instructorAgain" = 'True' as int)`),
            avgInstructorEnjoyed: knex.raw(`CAST("CourseReview"."instructorEnjoyed" = 'True' as int)`),
            /* Course specific */
            avgRating: "CourseReview.rating",
            avgValue: "CourseReview.value",
            avgDifficulty: "CourseReview.difficulty",
            avgHours: "CourseReview.hours",
            avgAgain: knex.raw(`CAST("CourseReview"."again" = 'True' as int)`),

        })
        .count({
            numReviews: "CourseReview.reviewID"
        });
}

export async function getBaseCourseAverages(threshold: number = 3) {
    const aggregateData = await knex.with("Base", (qb) => generateBaseCourseAverages(qb, threshold))
        .from("Base")
        .select("*");

    const courseAverages: CourseAverages[] = aggregateData.map((data) => {
        return {
            courseID: data.courseID,
            avgRating: parseFloat(data.avgRating),
            avgValue: parseFloat(data.avgValue),
            avgDifficulty: parseFloat(data.avgDifficulty),
            avgHours: parseFloat(data.avgHours),
            avgAgain: parseFloat(data.avgAgain),
            avgInstructorEffectiveness: parseFloat(data.avgInstructorEffectiveness),
            avgInstructorAccommodationLevel: parseFloat(data.avgInstructorAccommodationLevel),
            avgInstructorEnthusiasm: parseFloat(data.avgInstructorEnthusiasm),
            avgInstructorAgain: parseFloat(data.avgInstructorAgain),
            avgInstructorEnjoyed: parseFloat(data.avgInstructorEnjoyed),
            numReviews: parseInt(data.numReviews)
        }
    });



    return courseAverages;
}

export function generateBaseInstructorAverages(qb: Knex.QueryBuilder, count: number = 5) {

    return qb.with("InstructorReview", qb => qb.from("Review").where({
        "Review.deleted": false,
        "Review.archived": false
    })
        .select(reviewInfo)
    )
        .from("InstructorReview")
        .groupBy(["InstructorReview.instructorID"])
        .havingRaw(`count("InstructorReview"."instructorID") >= ?`, [count])
        .select(["InstructorReview.instructorID"])
        .avg({
            /* Instructor specific */
            avgInstructorEffectiveness: "InstructorReview.instructorEffectiveness",
            avgInstructorAccommodationLevel: "InstructorReview.instructorAccommodationLevel",
            avgInstructorEnthusiasm: "InstructorReview.instructorEnthusiasm",
            avgInstructorAgain: knex.raw(`CAST("InstructorReview"."instructorAgain" = 'True' as int)`),
            avgInstructorEnjoyed: knex.raw(`CAST("InstructorReview"."instructorEnjoyed" = 'True' as int)`),
            /* Instructor specific for courses */
            avgRating: "InstructorReview.rating",
            avgValue: "InstructorReview.value",
            avgDifficulty: "InstructorReview.difficulty",
            avgHours: "InstructorReview.hours",
            avgAgain: knex.raw(`CAST("InstructorReview"."again" = 'True' as int)`),

        })



}


export function getUserReviews(qb: Knex.QueryBuilder, userID: string) {
    return qb.from("Review")
        .where({
            "Review.deleted": false,
            "Review.archived": false,
            "Review.reviewerID": userID
        })
        .select(reviewInfo);
}


export function getUserReviewedDepartments(qb: Knex.QueryBuilder, userID: string) {
    return qb.with("userReviews", (qb) => getUserReviews(qb, userID))
        .from("userReviews")
        .leftJoin("Course", "userReviews.courseID", "Course.courseID")
        .select(["Course.departmentID"])
        .distinct("Course.departmentID");
}


export function getUserReviewedDepartmentCourseCodes(qb: Knex.QueryBuilder, userID: string) {
    return knex.with("reviewedDepartments", (qb) => {
        qb.from("reviewedDepartments")
            .join("Course", "reviewedDepartments.departmentID", "Course.departmentID")
            .select(["Course.departmentID", "Course.courseID"])
            /* Make sure courses have not already been reviewed */
            .with("userReviews", (qb) => {
                qb.from("userReviews")
                    .join("Course", "userReviews.courseID", "Course.courseID")
                    .select(["Course.courseID"])
                    .distinct("Course.courseID")
            })
            .whereNotIn("Course.courseID", knex.select("userReviews.courseID").from("userReviews"))
    }
    )
}



/**
 * Get the top value-for-difficulty courses
 * @param limit The max number of courses to return
 * @returns A list of such courses
 */

export async function getTopValueForDifficultyCourses(limit: number = 10): Promise<public_instructor[]> {

    const courses = await knex.with("Base", (qb) => generateBaseCourseAverages(qb))
        .from("Base")
        .select("*")
        .where("Base.avgDifficulty", "<=", 5)
        .where("Base.avgValue", ">=", 7)
        .where("Base.avgAgain", ">=", 0.6)
        /* sort by value-for-difficulty, avoid zero division */
        .orderByRaw(`("avgValue" + 1) / ("avgDifficulty" + 1) DESC`)
        .limit(limit)

    return courses;
}



export async function getTopCourses(limit: number = 10) {

    const courses = await knex.with("Base", (qb) => generateBaseCourseAverages(qb))
        .from("Base")
        .select("*")
        .where("Base.avgAgain", ">=", 0.7)
        .where("Base.avgRating", ">=", 7)
        .where("Base.avgValue", ">=", 7)
        .orderByRaw(`"avgRating" DESC`)
        .limit(limit)
        .join("Course", "Base.courseID", "Course.courseID")

    return courses;


}


export async function getTopInstructors(limit: number = 10) {

    const instructors = await knex.with("Base", (qb) => generateBaseInstructorAverages(qb))
        .from("Base")
        .select("*")
        // .where("Base.avgInstructorAgain", ">=", 0.7)
        .where("Base.avgInstructorEffectiveness", ">=", 7)
        // .where("Base.avgInstructorEnjoyed", ">=", 0.7)
        // .select([
        //     knex.raw(`(SELECT ((
        //          "avgInstructorEffectiveness" +
        //          "avgInstructorEnthusiasm" + 
        //          "avgInstructorAccommodationLevel" +                 
        //          (10.00 * "avgInstructorAgain") +
        //          (10.00 * "avgInstructorEnjoyed")
        //          ) 
        //          / 5.00) FROM "Base") 
        //          as "avgScore"`),
        // ])
        // .orderByRaw(`"avgScore" DESC`)
        // .limit(limit)
        .join("Instructor", "Base.instructorID", "Instructor.instructorID")
        .select(["Instructor.instructorID", "Instructor.name", "Instructor.email", "Instructor.departmentID", "Instructor.slug"])

    return instructors;


}


/**
 * Get top courses for a user based on the tags they have used in courses they liked
 * @param session The user's session
 * @param limit The max number of courses to return
 * @returns A list of such courses
 */
export async function getTopCoursesByTagAgg(session: CustomSession, limit: number = 10) {

    const courses = await knex.with("Base", (qb) => generateBaseCourseAverages(qb))
        .from("Base")
        .with("UserTags", (qb) => qb.from("Review")
            .where({
                "Review.deleted": false,
                "Review.archived": false,
                "Review.reviewerID": session.user.id
            })
            // .where("Review.rating", ">=", 6)
            //agg and count tags (each is an array of strings)
            .select([
                knex.raw(`array_agg("Review"."tags") as "tags"`),
                knex.raw(`count("Review"."tags") as "count"`),
                //if the user liked the course .where("Review.rating", ">=", 6), make the "liked" field true
                knex.raw(`bool_or("Review"."rating" >= 6) as "liked"`)
            ])
        )
        /* Now look for other courses with these tags */
        .with("TaggedCourses", (qb) => qb.from("Review")
            .where({
                "Review.deleted": false,
                "Review.archived": false
            })
            .select([
                knex.raw(`array_agg("Review"."tags") as "tags"`),
                knex.raw(`count("Review"."tags") as "count"`),
            ])
            //check if the course has the same tags as the user's liked courses
            // .whereIn("Review.tags", knex.raw(`(SELECT "UserTags"."tags" FROM "UserTags")`))

        )

        .limit(limit)
        .join("Course", "Base.courseID", "Course.courseID")

    return courses;


}



// RULE: Select the top items from the department that the user has already reviewed.
export async function getTopDepartmentCourses(session: CustomSession, limit: number = 5) {

    if (!session.user) {
        return [];
    }

    const courses = await knex.with("Base", (qb) => generateBaseCourseAverages(qb))
        .from("Base")
        .limit(limit)
        .with("UserReviews", (qb) => qb.from("Review").where({
            "Review.deleted": false,
            "Review.archived": false,
            "Review.reviewerID": session.user.id
        }))
        .join("Course", "Base.courseID", "Course.courseID")
        .with("UserDepartments", (qb) =>
            qb.from("UserReviews")
                .join("Course", "UserReviews.courseID", "Course.courseID")
                .select("Course.departmentID"))
        // .join("Course", "Base.courseID", "Course.courseID")
        //this needs to be Base.departmentID (not Course.departmentID) (we need to get the avgs)
        .where("Course.departmentID", "in", knex.from("UserDepartments").select("UserDepartments.departmentID"))
        .andWhere("Course.courseID", "not in", knex.from("UserReviews").select("UserReviews.courseID"))
    // do ranking here
    // +min score check;


    return courses;

}



export function getTopEasyAndValuableCourses(aggregateData: CourseAverages[], limit: number = 5) {

    const courses = aggregateData
        .filter((course) => {
            return course.avgValue >= 7 && course.avgDifficulty <= 4 && course.avgAgain >= 0.6;
        })
        .sort((a, b) => {
            return b.avgRating - a.avgRating;
        })
        .slice(0, limit)
        .map((course) => {
            return course.courseID;
        });


    return courses as string[];

}




export function getEasiestGoodCourses(aggregateData: CourseAverages[], limit: number = 5) {
    const courses = aggregateData
        .filter((course) => {
            return course.avgDifficulty <= 4 && course.avgAgain >= 0.6 && course.avgRating >= 6.5;
        })
        .sort((a, b) => {
            return a.avgDifficulty - b.avgDifficulty;
        })
        .slice(0, limit)
        .map((course) => {
            return course.courseID;
        });

    return courses as string[];

}


export function getLowTimeCommitmentCourses(aggregateData: CourseAverages[], limit: number = 5) {

    const courses = aggregateData
        .filter((course) => {
            return course.avgHours <= 3 && course.avgAgain >= 0.6 && course.avgRating >= 6.5;
        })
        .sort((a, b) => {
            return a.avgHours - b.avgHours;
        })
        .slice(0, limit);

    return courses as CourseAverages[];

}



export function getChallengingCourses(aggregateData: CourseAverages[], limit: number = 5) {

    const courses = aggregateData
        .filter((course) => {
            return course.avgDifficulty >= 7 && course.avgHours >= 5 && course.avgAgain >= 0.6 && course.avgRating >= 6.5;
        })
        .sort((a, b) => {
            return (b.avgDifficulty * b.avgHours) - (a.avgDifficulty * a.avgHours);
        })
        .slice(0, limit);

    return courses as CourseAverages[];

}

