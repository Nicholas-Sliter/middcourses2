import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("Review", (table) => {
    table
      .uuid("reviewID")
      .unique()
      .notNullable(); /* Review ID: Unique ID for each review */
		table
			.uuid("reviewerID")
			.notNullable();
    table
      .foreign("reviewerID") /* Reviewer ID: Unique ID for the reviewer */
    table
      .string("courseID")
      .notNullable();
    table
      .foreign("courseID") /* Course ID: Unique ID for the course */
    table
      .string("semester")
      .notNullable(); /* Semester: Semester of the review */
    table
      .text("content")
      .notNullable(); /* Content: Text of the review */
    table
      .integer("rating") /* Rating: Rating of the review from 1-10 */
    table
      .date("reviewDate")
      .notNullable(); /* Review Date: Date of the review */
    table
      .boolean("approved")
      .notNullable().defaultTo(true); /* Approved: Whether the review has been approved */
    table
      .integer("flagCount")
      .notNullable().defaultTo(0); /* Flag Count: how many times a review has been flagged */
    table
      .string("instructorID")
      .notNullable(); /* Instructor ID: Unique ID for the instructor */
    table
      .foreign("instructorID") 

  })
};


export async function down(knex: Knex): Promise<void> {
}

