import process from "process";

import knexConfig from "../../../knexfile";
import knexInitializer from "knex";
import { uuidv4 } from "./utils";
import { Scraper } from "directory.js";
import { checkIfFirstSemester, departmentNameMapping } from "../common/utils";

export const knex = knexInitializer(
  knexConfig[process.env.NODE_ENV || "development"]
);


const reviewInfo = [
  "reviewID",
  "courseID",
  "instructorID",
  "semester",
  "reviewDate",
  "rating",
  "content",
  "voteCount",

  "difficulty",
  "value",
  "hours",
  "again",
  "primaryComponent",

  "instructorEffectiveness",
  "instructorAccommodationLevel",
  "instructorEnthusiasm",
  "instructorAgain",
];


/**
 * A function that gets an approved review from the database by its id.
 * @param reviewId The id of the review to get.
 * @returns A promise that resolves to the review or null if it doesn't exist.
 *
 */
export async function getReviewByID(id: string): Promise<any> {
  const review = await knex("Review")
    .where({
      reviewID: id,
      approved: true,
      //deleted: false,
      //archived: false,
    })
    .first()
    .select(reviewInfo);

  if (!review) {
    return null;
  }

  return review;
}

/**
 * A function that gets any full review from the database by its id.
 * WARNING: do not ever call this function directly from the frontend or
 * an api endpoint as it can leak information.
 * @param reviewId The id of the review to get.
 * @returns A promise that resolves to the review or null if it doesn't exist.
 *
 */
async function __getFullReviewByID(id: string): Promise<any> {
  const review = await knex("Review")
    .where({
      reviewID: id,
    })
    .first();

  if (!review) {
    return null;
  }

  return review;
}

//get all review for a course
export async function getReviewsByCourseID(courseID: string): Promise<any> {
  const reviews = await knex("Review")
    .where({
      courseID: courseID,
      approved: true,
      //deleted: false,
      //archived: false,
    })
    .select(reviewInfo);

  if (!reviews) {
    return null;
  }

  return reviews;
}

/**
 * A function that gets all active reviews associated with an instructor.
 * @authentication {instructors: self-only, students: canReadReviews true}
 * @param instructorID 
 * @returns a list of all reviews for a given instructor
 */
export async function getReviewsByInstructorID(
  instructorID: string
): Promise<any> {
  const reviews = await knex("reviews")
    .where({
      instructorID: instructorID,
    })
    .select(reviewInfo);

  if (!reviews) {
    return null;
  }

  return reviews;
}


/**
 * A function that gets a review from the database by its reviewer's id.
 * WARNING: do not call this function without authentication. Only allow a user
 * to access their own reviews.
 * @authentication This function requires authentication.
 * @param id the id of a reviewer
 * @returns A promise that resolves to the reviews or an empty array
 */
export async function getReviewsByUserID(id: string): Promise<any> {
  const reviews = await knex("Review")
    .where({
      reviewerID: id,
    })
    .select(["reviewID", "semester", "rating", "content"]); //decide how to return

  if (!reviews) {
    return [];
  }

  return reviews;
}

/**
 * A function that gets an instructor by their id.
 * Usage: Public
 * @param id 
 * @returns A promise that resolves to an instructor object or null if it doesn't exist.
 * 
 */
export async function getInstructorByID(id: string): Promise<any>{

  const instructor = await knex("Instructor")
    .where({
      instructorID: id,
    })
    .first()
    .select(["name", "instructorID", "slug"]);

    if (!instructor) {
      return null;
    }

    return instructor;


}


/**
 * A function that gets an instructor by their slug.
 * @authentication {public}
 * @param id 
 * @returns A promise that resolves to an instructor object or null if it doesn't exist.
 * 
 */
export async function getInstructorBySlug(slug: string): Promise<any>{

  const instructor = await knex("Instructor")
    .where({
      slug: slug,
    })
    .first()
    .select(["name", "instructorID", "slug"]);

    if (!instructor) {
      return null;
    }

    return instructor;


}


/**
 * Get a course by its id.
 * @param id the course id in DEPTCODE format (eg. CSCI0101)
 * @returns 
 */
export async function getCourseByID(id:string): Promise<any>{
  const course = await knex("Course")
    .where({
      courseID: id,
    })
    .first()
    .select(["courseID", "courseName", "courseDescription"]);

  if (!course) {
    return null;
  }

  return course;


}


/** */
export async function getInstructorsByCourseID(id:string){
  //search through the CourseInstructor table for all instructors associated with a course
  const instructors = await knex("CourseInstructor")
    .where({
      courseID: id,
    })
    .select(["instructorID"]);

  if (!instructors || instructors.length == 0) {
    return null;
  }

  return instructors;

}


/**
 * A function that gets all courses associated with an instructor.
 * 
 */
export async function getCoursesByInstructorID(id:string){
  //search through the CourseInstructor table for all instructors associated with a course
  const courses = await knex("CourseInstructor")
    .where({
      instructorID: id,
    })
    .select(["courseID"]);

  if (!courses || courses.length == 0) {
    return null;
  }

  return courses;

}



/**
 * @authentication {self only}
 * */
export async function getUserByEmail(email:string){

    const user = await knex("User")
    .where({
      userEmail: email,
    })
    .first()
    .select(["userID",
     "userEmail",
     "userType",
     "canReadReviews"]);

    if (!user) {
      return null;
    }

    return user;

}

/**
 * Check if a user has already been created.
 * @param email 
 * @returns boolean if the user exists
 */
export async function checkIfUserExists(email:string){

    const user = await getUserByEmail(email);
    if (!user) {
      return false;
    }

    return true;

}


/** */
export async function generateUser(email:string){

  const user = {
    userEmail: email,
    userID: uuidv4(),
    userType: "",
    canReadReviews: false,
    graduationYear: "",
    createdAt: new Date().toISOString(),
  };

  //get verified user info from the Middlebury directory
  const S = new Scraper(email);
  await S.init();
  
  user.userType = S.person.type.toLowerCase();
  user.graduationYear = S.person?.gradYear ?? null;
  //user.departmentID = departmentNameMapping[S.person?.department] ?? null;

  user.canReadReviews = (checkIfFirstSemester(user.graduationYear)) ? true : false;

  console.log(user);

  const result = await knex("User")
    .insert(user)
    .returning("*");

  if (!result) {
    throw new Error("Failed to create user");
  }

  return result;


}




//dev tools for testing ****REMOVE BEFORE RELEASE****
export async function getAllUsers(){
  return await knex("User")
    .select(["userID", "userEmail", "userType", "canReadReviews", "graduationYear"]);
}