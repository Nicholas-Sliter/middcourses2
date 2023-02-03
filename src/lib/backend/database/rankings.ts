import knex from "./knex";
import { reviewInfo } from "./common";
import { CustomSession, public_instructor, public_review } from "../../common/types";
import { compareTerm, parseCourseID, sortCoursesByTerm } from "../../common/utils";
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
        .with("CourseAliases", (qb) => {
            qb.from("Course")
                .joinRaw("LEFT JOIN \"Alias\" ON \"Alias\".\"aliasID\" = \"Course\".\"courseID\"")
                .select({
                    courseID: "Course.courseID",
                    primaryCourseID: knex.raw("COALESCE(\"Alias\".\"courseID\", \"Course\".\"courseID\")"),
                });
        })
        .from("CourseReview")
        .leftJoin("CourseAliases", "CourseAliases.courseID", "CourseReview.courseID")
        .groupBy("primaryCourseID")
        .havingRaw(`count(*) >= ?`, [count])
        .select(["primaryCourseID as courseID"])
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
            // topTags: knex.raw(`array_agg(DISTINCT(UNNEST("CourseReview"."tags")))`)
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


export async function getUserMajorMinors(session: CustomSession) {
    if (!session.user) {
        return [];
    }

    const majorMinorDates = await knex.from("Review")
        .where({
            "Review.deleted": false,
            "Review.archived": false,
            "Review.reviewerID": session.user.id
        })
        .join("Course", "Review.courseID", "Course.courseID")
        // .orderBy("Review.reviewDate", "desc")
        .select(["Course.departmentID", "Review.inMajorMinor", "Review.semester"])
        //for any department take the most recent review
        .groupBy(["Course.departmentID", "Review.inMajorMinor", "Review.semester"])
    // .havingIn("Review.inMajorMinor", ["major", "minor"])

    const statusSemester = new Map<string, { status: string, semester: string }>();
    majorMinorDates.forEach((row) => {
        if (!statusSemester.has(row.departmentID)) {
            statusSemester.set(row.departmentID, { status: row.inMajorMinor, semester: row.semester });
        }
        else {
            const old = statusSemester.get(row.departmentID);
            if (compareTerm(old.semester, row.semester) === 0 && row.status === "neither") {
                /* Prefer the "neither" status */
                statusSemester.set(row.departmentID, { status: row.inMajorMinor, semester: row.semester });
            }
            if (compareTerm(old.semester, row.semester) < 0) {
                statusSemester.set(row.departmentID, { status: row.inMajorMinor, semester: row.semester });
            }
        }
    });

    const latestMajors = new Map<string, string>();
    const latestMinors = new Map<string, string>();

    statusSemester.forEach((value, key) => {
        if (value.status === "major") {
            if (latestMinors.has(key)) {
                if (compareTerm(latestMinors.get(key), value.semester) > 0) {
                    latestMinors.delete(key);
                }
            }
            latestMajors.set(key, value.semester);
        }
        else if (value.status === "minor") {
            if (latestMajors.has(key)) {
                if (compareTerm(latestMajors.get(key), value.semester) > 0) {
                    latestMajors.delete(key);
                }
            }
            latestMinors.set(key, value.semester);
        }

    });

    //sort majors and minors by semester
    const sortedMajors = Array.from(latestMajors).sort((a, b) => {
        return compareTerm(a[1], b[1]);
    });
    const sortedMinors = Array.from(latestMinors).sort((a, b) => {
        return compareTerm(a[1], b[1]);
    });

    //get top 2 majors and top 2 minors
    const topMajors = sortedMajors.filter(major => major[0] !== "FYSE").slice(0, 2);
    const topMinors = sortedMinors.filter(minor => minor[0] !== "FYSE").slice(0, 2);

    //need to filter to top 2 majors by semester and top 2 minors by semester
    const latestMajorMinor = new Map<string, string>();
    topMajors.forEach((value) => {
        latestMajorMinor.set(value[0], "major");
    });
    topMinors.forEach((value) => {
        latestMajorMinor.set(value[0], "minor");
    });


    return Array.from(latestMajorMinor);

}

export function bestInterdepartmentalCourses(aggregateData: CourseAverages[], limit: number = 5) {

    const courses = aggregateData
        .filter((course) => {
            return course.avgValue >= 7 && course.avgAgain >= 0.6;
        })
        .filter((course) => {
            return course.courseID.substring(0, 4) === "INTD";
        })
        .sort((a, b) => {
            return (b.avgValue ** 2 + b.avgRating) - (a.avgValue ** 2 + a.avgRating);
        })
        .slice(0, limit)
        .map((course) => {
            return course.courseID;
        });

    return courses as string[];

}

export function getTopUpcomingCourses(aggregateData: CourseAverages[], limit: number = 5, session: CustomSession, data: string[]) {

    //data is a list of courseIDs given for the upcoming semester

    const upcomingCourseSet = new Set(data.map((course: any) => course.courseID));

    const courses = aggregateData
        .filter((course) => {
            return course.avgValue >= 7 && course.avgAgain >= 0.6;
        })
        .filter((course) => {
            return upcomingCourseSet.has(course.courseID);
        })
        .sort((a, b) => {
            return (b.avgValue ** 2 + b.avgRating) - (a.avgValue ** 2 + a.avgRating);
        })
        .slice(0, limit)
        .map((course) => {
            return course.courseID;
        });

    return courses as string[];

}


export function getTopEasyAndValuableCourses(aggregateData: CourseAverages[], limit: number = 5) {

    const courses = aggregateData
        .filter((course) => {
            return course.avgValue >= 7 && course.avgDifficulty <= 4 && course.avgAgain >= 0.6;
        })
        .sort((a, b) => {
            return (b.avgValue ** 2 + b.avgRating) - (a.avgValue ** 2 + a.avgRating);
        })
        .slice(0, limit)
        .map((course) => {
            return course.courseID;
        });


    return courses as string[];

}


export function getTopMajorCourses(aggregateData: CourseAverages[], limit: number = 5, session: CustomSession, data: any) {

    const majors = data.filter(row => row[1] === "major").map(row => row[0]);

    const courses = aggregateData.filter((course) => {
        const { department, courseNumber } = parseCourseID(course.courseID);
        return majors.includes(department);
    })
        .filter((course) => { return course.avgValue >= 5 && course.avgAgain >= 0.6 && course.avgRating >= 5; })
        .sort((a, b) => {
            return (b.avgValue ** 2 + b.avgRating) - (a.avgValue ** 2 + a.avgRating);
        })
        .slice(0, limit)
        .map((course) => {
            return course.courseID;
        });


    return courses as string[];
}

export function getTopMinorCourses(aggregateData: CourseAverages[], limit: number = 5, session: CustomSession, data: any) {

    const majors = data.filter(row => row[1] === "minor").map(row => row[0]);

    const courses = aggregateData.filter((course) => {
        const { department, courseNumber } = parseCourseID(course.courseID);
        return majors.includes(department);
    })
        .filter((course) => { return course.avgValue >= 5 && course.avgAgain >= 0.6 && course.avgRating >= 5; })
        .sort((a, b) => {
            return (b.avgValue ** 2 + b.avgRating) - (a.avgValue ** 2 + a.avgRating);
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
        .slice(0, limit)
        .map((course) => {
            return course.courseID;
        });

    return courses as string[];

}



export function getChallengingCourses(aggregateData: CourseAverages[], limit: number = 5) {

    const courses = aggregateData
        .filter((course) => {
            return course.avgDifficulty >= 7 && course.avgHours >= 5 && course.avgAgain >= 0.5 && course.avgRating >= 5;
        })
        .sort((a, b) => {
            return (b.avgDifficulty * b.avgHours) - (a.avgDifficulty * a.avgHours);
        })
        .slice(0, limit)
        .map((course) => {
            return course.courseID;
        });

    return courses as string[];

}



export function getTopRatedCourses(aggregateData: CourseAverages[], limit: number = 5) {

    const courses = aggregateData
        .filter((course) => {
            return course.avgRating >= 8 && course.avgAgain >= 0.6;
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


export function getNecessaryCourses(aggregateData: CourseAverages[], limit: number = 5) {

    const courses = aggregateData
        .filter((course) => {
            return course.avgValue >= 7 && course.avgAgain >= 0.7 && course.avgRating >= 6.5;
        })
        .sort((a, b) => {
            return (b.avgValue * b.avgRating * b.avgAgain) - (a.avgValue * a.avgRating * a.avgAgain)
        })
        .slice(0, limit)
        .map((course) => {
            return course.courseID;
        });

    return courses as string[];

}


export function getLearnALotCourses(aggregateData: CourseAverages[], limit: number = 5) {

    const courses = aggregateData
        .filter((course) => {
            return course.avgValue >= 6 && course.avgAgain >= 0.6 && course.avgRating >= 6.5;
        })
        .sort((a, b) => {
            return (b.avgValue * b.avgDifficulty) - (a.avgValue * a.avgDifficulty)
        })
        .slice(0, limit)
        .map((course) => {
            return course.courseID;
        });

    return courses as string[];

}