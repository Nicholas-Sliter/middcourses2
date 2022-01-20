import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("Course", (table) => {
    table
      .string("courseID")
      .notNullable(); /* Course ID: 4-digit department identifier followed by course number, eg. CSCI0201  */
    table
      .string("courseCRN")
      .notNullable(); /* Course CRN: Course registration number */
    table
      .string("courseName")
      .notNullable(); /* Course Name: Course name */
		table
			.text("courseDescription")
			.notNullable(); /* Course Description: Course description */
		table
			.string("courseDepartment")
			.notNullable(); /* Course Department: Department abbreviation */
  })
	.createTable("Department", (table) => {
		table
			.string("departmentID", 4)
			.unique()
			.notNullable(); /* Department ID: 4-letter department abbreviation */
		table
			.string("departmentName")
			.notNullable(); /* Department Name: Department name */
		table
			.string("departmentDescription")
			.notNullable(); /* Department Description: Department description */
	})
	.createTable("Review",(table)=>{
		table
			.uuid("reviewID")
			.unique()
			.notNullable(); /* Review ID: Unique ID for each review */
		table
			.uuid("reviewerID")
			.notNullable(); /* Reviewer ID: Unique ID for the reviewer */
		table
			.foreign("courseID") /* Course ID: Unique ID for the course */
		table
			.string("semester")
			.notNullable(); /* Semester: Semester of the review */
		table
			.text("review")
			.notNullable(); /* Review: Text of the review */
		table
			.integer("rating") /* Rating: Rating of the review from 1-10 */
		table
			.date("reviewDate")
			.notNullable(); /* Review Date: Date of the review */
		table
			.boolean("approved")
			.notNullable().defaultTo(true); /* Approved: Whether the review has been approved */


	});
}

export async function down(knex: Knex): Promise<void> {}
