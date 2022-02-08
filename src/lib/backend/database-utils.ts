import process from "process";

import knexConfig from "../../../knexfile";
import knexInitializer from "knex";

export const knex = knexInitializer(
  knexConfig[process.env.NODE_ENV || "development"]
);

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
    })
    .first()
    .select(["reviewID", "semester", "courseID", "reviewDate", "instructorID", "rating", "content"]);

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
  const reviews = await knex("reviews")
    .where({
      courseID: courseID,
    })
    .select(["id", "title", "content", "rating", "created_at", "updated_at"]);

  if (!reviews) {
    return null;
  }

  return reviews;
}

export async function getReviewsByInstructorID(
  instructorID: string
): Promise<any> {
  const reviews = await knex("reviews")
    .where({
      instructorID: instructorID,
    })
    .select(["id", "title", "content", "rating", "created_at", "updated_at"]);

  if (!reviews) {
    return null;
  }

  return reviews;
}

/**
 * A function that gets a review from the database by its reviewer's id.
 * WARNING: do not call this function without authentication. Only allow a user
 * to access their own reviews.
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