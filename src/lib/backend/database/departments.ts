import { reviewInfo } from "./common";
import knex from "./knex";

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

export async function getDepartmentByName(departmentName: string) {
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



export async function optimizedSSRDepartmentPage(departmentID: string, authorized: boolean) {

    if (!departmentID || departmentID.length > 10) {
        return null;
    }

    const [departmentQuery, instructorQuery, reviewQuery, courseQuery] = await Promise.all([
        getDepartmentByID(departmentID),
        getInstructorsByDepartmentCourses(departmentID),
        getMostRecentReviewsByDepartment(departmentID, 5),
        getCoursesByDepartment(departmentID)
    ]);

    return {
        departmentID: departmentID,
        departmentName: departmentQuery.departmentName,
        instructors: instructorQuery,
        reviews: reviewQuery,
        courses: courseQuery
    }

}