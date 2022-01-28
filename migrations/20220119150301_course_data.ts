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
	});
}

export async function down(knex: Knex): Promise<void> {}
