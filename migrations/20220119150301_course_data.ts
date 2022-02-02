import { table } from "console";
import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("Course", (table) => {
    table
      .string("courseID")
      .notNullable(); /* Course ID: 4-digit department identifier followed by course number, eg. CSCI0201  */
    table
			.string("courseDepartmentID")
			.notNullable(); /* Course Department: Department abbreviation */
      table
      .string("courseName")
      .notNullable(); /* Course Name: Course name */
		table
			.text("courseDescription")
			.notNullable(); /* Course Description: Course description */
  })
  .createTable("Instructor", (table) => {
    table
      .string("name")
      .notNullable();
    table
      .string("instructorID")
      .notNullable();
  })
  .createTable("CourseInstructor", (table) => {
    table
      .string("courseID")
      .notNullable();
      table
      .string("instructorID")
      .notNullable();
    table
      .foreign("courseID")
      .references("Course.courseID")
      .onDelete("CASCADE");
    table
      .foreign("instructorID")
      .references("Instructor.instructorID")
      .onDelete("CASCADE");
  })
	.createTable("Department", (table) => {
		table
			.string("departmentID", 4)
			.unique()
			.notNullable(); /* Department ID: 4-letter department abbreviation */
		table
			.string("departmentName")
			.notNullable(); /* Department Name: Department name */
	});
}

export async function down(knex: Knex): Promise<void> {}
