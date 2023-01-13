import { public_review } from "../../common/types";
import { parseAvg } from "../utils";
import { reviewInfo } from "./common";
import knex from "./knex";
import { getReviewsByDepartmentID } from "./review";

/**
 * Get all the departments in the database.
 * @returns a list of all departments
 */
export async function getAllDepartments() {
    return await knex("Department")
        .select(["Department.departmentID", "Department.departmentName"]);

}

export async function getDepartmentByID(departmentID: string) {
    return await knex("Department")
        .select(["Department.departmentID", "Department.departmentName"])
        .first()
        .where({ departmentID });
}

export async function getDepartmentByName(departmentName: string): Promise<{ departmentID: string }> {
    return await knex("Department")
        .select(["Department.departmentID", "Department.departmentName"])
        .first()
        .where({ departmentName });
}

export async function getTopReviewedDepartments(limit: number) {
    return await knex("Department")
        .select(["Department.departmentID", "Department.departmentName"])
        .groupBy("Department.departmentID")
        .join("Course", "Department.departmentID", "Course.departmentID")
        .join("Review", "Course.courseID", "Review.courseID")
        .count("Review.courseID as numReviews")
        .orderBy("numReviews", "desc")
        .limit(limit);
}


export async function getTopRatedDepartments(limit: number) {
    const REVIEW_THRESHOLD = 10;

    return await knex("Department")
        .select(["Department.departmentID", "Department.departmentName"])
        .join("Course", "Department.departmentID", "Course.departmentID")
        .join("Review", "Course.courseID", "Review.courseID")
        .count("Review.courseID as numReviews")
        .groupBy("Department.departmentID")
        .having("numReviews", ">=", REVIEW_THRESHOLD)
        .avg("Review.rating as avgRating")
        .orderBy("avgRating", "desc")
        .limit(limit);

}



export async function getMostRecentReviewsByDepartment(departmentID: string, limit: number) {
    return await knex("Course")
        .where({ "Course.departmentID": departmentID })
        .join("Review", "Course.courseID", "Review.courseID")
        .where({
            'Review.deleted': false,
            'Review.archived': false,
            'Review.approved': true
        })
        .select([
            'Review.reviewID',
            'Review.courseID',
            'Review.instructorID',
            'Review.rating',
            'Review.reviewDate',
            'Review.content',
        ])
        .orderBy("Review.reviewDate", "desc")
        .limit(limit);
}

/**
 * Get instructors who teach in a department
 * @param departmentID 
 * @returns a list of all instructors who teach in the given department
 */
export async function getInstructorsByDepartmentCourses(departmentID: string) {
    return await knex("Course")
        .where({ "Course.departmentID": departmentID })
        .join("CourseInstructor", "Course.courseID", "CourseInstructor.courseID")
        .join("Instructor", "CourseInstructor.instructorID", "Instructor.instructorID")
        .select(["Instructor.name", "Instructor.slug", "Instructor.instructorID", "Instructor.email"])
        .distinct("Instructor.instructorID");

}

/**
 * Get courses by department.
 * @param departmentID
 * @returns a list of all courses in the given department
 */
export async function getCoursesByDepartment(departmentID: string) {
    return await knex("Course")
        .where({ departmentID })
        .select(["Course.courseID", "Course.courseName", "Course.courseDescription"])
        .groupBy("Course.courseID")
        .leftJoin("Review", "Course.courseID", "Review.courseID")
        .count("Review.reviewID as numReviews")
}



/**
 * Get department's like a query
 * @param query 
 * @returns a list of departments that match the given query
 */
export async function searchDepartments(query: string, limit: number = 10) {
    return await knex("Department")
        .select(["Department.departmentID", "Department.departmentName"])
        .where("Department.departmentName", "ilike", `%${query}%`)
        .andWhereNot({
            "Department.departmentID": "PHED"
        }) /* exclude PHED, need 2 of these b/c of the orWhere clause */
        .orWhere("Department.departmentID", "ilike", `%${query}%`)
        .andWhereNot({
            "Department.departmentID": "PHED"
        }) /* exclude PHED */
        .limit(limit);
}



export async function optimizedSSRDepartmentPage(departmentID: string, authorized: boolean) {

    if (!departmentID || departmentID.length > 10) {
        return null;
    }

    const MAX_DISPLAYED_REVIEWS = (authorized) ? 10 : 3;
    const DEPARTMENT_MIN_AVG_COUNT = 10; // Minimum number of reviews for a department to display average ratings

    const [departmentQuery, instructorQuery, reviewQuery, courseQuery] = await Promise.all([
        getDepartmentByID(departmentID),
        getInstructorsByDepartmentCourses(departmentID),
        // getMostRecentReviewsByDepartment(departmentID, 5),
        getReviewsByDepartmentID(departmentID),
        getCoursesByDepartment(departmentID)
    ]);


    const obj = {
        department: departmentQuery,
        instructors: instructorQuery,
        reviews: [] as public_review[],
        courses: courseQuery,
        avgRating: parseAvg(reviewQuery?.[0]?.avgRating),
        avgDifficulty: parseAvg(reviewQuery?.[0]?.avgDifficulty),
        avgHours: parseAvg(reviewQuery?.[0]?.avgHours),
        avgValue: parseAvg(reviewQuery?.[0]?.avgValue),
        avgAgain: parseAvg(reviewQuery?.[0]?.avgAgain),
        avgAccommodationLevel: parseAvg(reviewQuery?.[0]?.avgAccommodationLevel),
        avgEffectiveness: parseAvg(reviewQuery?.[0]?.avgEffectiveness),
        avgEnthusiasm: parseAvg(reviewQuery?.[0]?.avgEnthusiasm),
        avgInstructorAgain: parseAvg(reviewQuery?.[0]?.avgInstructorAgain),
        avgInstructorEnjoyed: parseAvg(reviewQuery?.[0]?.avgInstructorEnjoyed),

    }

    const reviews = reviewQuery.map((r) => {
        const newReview = { ...r };
        delete newReview["avgRating"];
        delete newReview["avgDifficulty"];
        delete newReview["avgValue"];
        delete newReview["avgAgain"];
        delete newReview["avgHours"];
        delete newReview["avgAccommodationLevel"];
        delete newReview["avgEffectiveness"];
        delete newReview["avgEnthusiasm"];
        delete newReview["avgInstructorAgain"];
        delete newReview["avgInstructorEnjoyed"];
        return newReview;
    });

    const numReviews = reviews.length;
    obj.reviews = reviews.splice(0, MAX_DISPLAYED_REVIEWS);

    if (numReviews < DEPARTMENT_MIN_AVG_COUNT) {
        obj.avgRating = null;
        obj.avgDifficulty = null;
        obj.avgValue = null;
        obj.avgAgain = null;
        obj.avgHours = null;
        obj.avgAccommodationLevel = null;
        obj.avgEffectiveness = null;
        obj.avgEnthusiasm = null;
        obj.avgInstructorAgain = null;
        obj.avgInstructorEnjoyed = null;
    }



    return obj;

}