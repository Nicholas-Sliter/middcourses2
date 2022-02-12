
exports.up = function (knex) {
  return knex.schema.createTable("Review", (table) => {
    table
      .uuid("reviewID")
      .unique()
      .notNullable(); /* Review ID: Unique ID for each review */
    table.uuid("reviewerID").notNullable();
    table.foreign("reviewerID"); /* Reviewer ID: Unique ID for the reviewer */
    table.string("courseID").notNullable();
    table.foreign("courseID"); /* Course ID: Unique ID for the course */
    table
      .string("instructorID")
      .notNullable(); /* Instructor ID: Unique ID for the instructor */
    table.foreign("instructorID");
    table
      .string("semester")
      .notNullable(); /* Semester: Semester of the review */

    table.text("content").notNullable(); /* Content: Text of the review */
    table.integer(
      "rating"
    ); /* Rating: Overall Rating of the course from 1-10 */
    table.integer(
      "difficulty"
    ); /* Difficulty: Difficulty and workload of the course from 1-10 */
    table.integer("value"); /* Value: value gained from the course from 1-10 */
    table.integer(
      "hours"
    ); /* Number of hours spent on the course per week outside of class */
    table.boolean(
      "again"
    ); /* Again: Whether or not the student would take the course again */

    table.enu("primaryComponent", [
      "exam",
      "project",
      "writing",
      "research",
      "lab",
      "discussion",
      "homework",
    ]); /* PrimaryComponent: Main Components of the course (exams, projects, writing, research, etc) */

    table.integer(
      "instructorEffectiveness"
    ); /* Teaching Quality of the instructor from 1-10 */
    table.integer(
      "instructorAccommodationLevel"
    ); /* How accommodating was the instructor from 1-10 */
    table.integer(
      "instructorEnthusiasm"
    ); /* Enthusiasm of the instructor from 1-10 */
    table.boolean(
      "instructorAgain"
    ); /* Would the student take another course from this instructor */

    //instructor rating is constructed from weighted average of the instructor quality and helpfulness

    table
      .timestamp("reviewDate")
      .notNullable(); /* Review Date: Date of the review */
    table
      .boolean("approved")
      .notNullable()
      .defaultTo(true); /* Approved: Whether the review has been approved */
    table
      .boolean("deleted")
      .notNullable()
      .defaultTo(false); /* Deleted: Whether the review has been deleted */
    table.boolean("archived").notNullable().defaultTo(false); /* Archived: Whether the review has been archived */

    table.json(
      "upvotes"
    ); /* Upvotes: JSON Array of user IDs who upvoted the review */
    table.json(
      "downvotes"
    ); /* Downvotes: JSON Array of user IDs who downvoted the review */
    table.integer(
      "voteCount"
    ); /* VoteCount: current non-fuzzied value equal to upvotes - downvotes*/

    table
      .boolean("flagged")
      .notNullable()
      .defaultTo(false); /* Flagged: Whether the review has been flagged */
    table.json(
      "flaggedBy"
    ).defaultTo("[]"); /* Flagged By: JSON Array of Unique IDs for the users who flagged the review */
    table
      .integer("flaggedCount")
      .notNullable()
      .defaultTo(0); /* Flag Count: how many times a review has been flagged */
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("Review");
};
