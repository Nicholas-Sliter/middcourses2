import process from "process";

import knexConfig from "../../../knexfile";
import knexInitializer from "knex";

export const knex = knexInitializer(
  knexConfig[process.env.NODE_ENV || "development"]
);

/**
 * A function that gets a review from the database by its id.
 * @param reviewId The id of the review to get.
 * @returns A promise that resolves to the review or null if it doesn't exist.
 *
 */
export async function getReviewByID(reviewID: string): Promise<any> {
  const review = await knex("reviews")
    .where({
      id: reviewID,
    })
    .first()
    .select(["id", "title", "content", "rating", "created_at", "updated_at"]);

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
