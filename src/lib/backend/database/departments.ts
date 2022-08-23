import knex from "./knex";

/**
 * Get all the departments in the database.
 * @returns a list of all departments
 */
export async function getAllDepartments() {
    return await knex("Department")
        .select(["Department.departmentID", "Department.departmentName"]);

}

export async function getDepartmentByID(departmentID: number) {
    return await knex("Department")
        .select(["Department.departmentID", "Department.departmentName"])
        .where({ departmentID });
}

export async function getDepartmentByName(departmentName: string) {
    return await knex("Department")
        .select(["Department.departmentID", "Department.departmentName"])
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


