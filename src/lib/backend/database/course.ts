import knex from "./knex";
import { reviewInfo } from "./common";
import { CustomSession, public_instructor, public_review } from "../../common/types";
import { getReviewByCourseIDWithVotes } from "./review";
import { is100LevelCourse } from "../../common/utils";

export async function getCourse(id: string) {
    return await knex("Course")
        .where("Course.courseID", id)
        .first();
}

async function getCourseReviews(id: string, session: CustomSession, authorized: boolean) {

    // if (!authorized) {
    //     return [];
    // }

    // return await knex("Review")
    //     .where("Review.courseID", id)
    //     .select(reviewInfo);
    console.log(session?.user?.id);
    return await getReviewByCourseIDWithVotes(id, session?.user?.id);
}

async function getCourseInfo(id: string) {
    return await knex("Course")
        .where({ "Course.courseID": id })
        .select(["Course.courseName", "Course.courseDescription", "Course.departmentID", "Course.courseID"])
        .leftJoin("CourseInstructor", "Course.courseID", "CourseInstructor.courseID")
        .distinct("CourseInstructor.instructorID")
        .leftJoin("Instructor", "CourseInstructor.instructorID", "Instructor.instructorID")
        .select(["Instructor.instructorID", "Instructor.name", "Instructor.slug"])
        .leftJoin("Department", "Course.departmentID", "Department.departmentID")
        .select(["Department.departmentName"]);
}

export async function optimizedSSRCoursePage(id: string, session: CustomSession) {

    const authorized: boolean = session?.user?.authorized ||
        session?.user?.role === "admin" ||
        session?.user?.role === "instructor" ||
        is100LevelCourse(id);

    const outputFormatter = (results, reviews) => {
        if (!results) {
            return null;
        }

        const parseAvg = (avg: string | null) => {
            if (!avg) {
                return null;
            }
            return parseFloat(avg);
        }

        const output = {
            courseID: results[0].courseID as string,
            courseName: results[0].courseName as string,
            courseDescription: results[0].courseDescription as string,
            departmentID: results[0].departmentID as string,
            departmentName: results[0].departmentName as string,
            instructors: [] as public_instructor[],
            reviews: [] as public_review[],
            avgRating: parseAvg(reviews?.[0]?.avgRating),
            avgDifficulty: parseAvg(reviews?.[0]?.avgDifficulty),
            avgHours: parseAvg(reviews?.[0]?.avgHours),
            avgValue: parseAvg(reviews?.[0]?.avgValue),
            avgAgain: parseAvg(reviews?.[0]?.avgAgain),
            topTags: [] as string[],

        }

        // remove averages from reviews
        const updatedReviews: public_review[] = reviews.map((review) => {
            const newReview = { ...review };
            delete newReview.avgRating
            delete newReview.avgDifficulty;
            delete newReview.avgHours;
            delete newReview.avgValue;
            delete newReview.avgAgain;
            return newReview;
        });


        output.reviews.push(...updatedReviews);


        //build a freq list of tags, return the top 3 if they have a freq of 2 or more
        const tagFreq: { [key: string]: number } = {};
        for (const review of reviews) {
            for (const tag of review?.tags ?? []) {
                if (tagFreq[tag]) {
                    tagFreq[tag]++;
                } else {
                    tagFreq[tag] = 1;
                }
            }
        }

        // return the top 3 tags if they have a freq of 3 or more
        const MIN_TAG_FREQ = 3;
        const tagFreqList = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]);
        for (let i = 0; i < 3; i++) {
            if (tagFreqList[i] && tagFreqList[i][1] >= MIN_TAG_FREQ) {
                output.topTags.push(tagFreqList[i][0]);
            }
        }

        results.forEach((result) => {
            output.instructors.push({
                instructorID: result.instructorID,
                name: result.name,
                slug: result.slug,
            });
        });

        return output;

    }

    // use PostgreSQL Array_agg in prod

    const [mainQuery, reviewQuery] = await Promise.all([getCourseInfo(id), getCourseReviews(id, session, authorized)]);

    return (outputFormatter(mainQuery, reviewQuery));

}

