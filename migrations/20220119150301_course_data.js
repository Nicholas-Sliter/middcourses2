exports.up = function (knex) {
  return knex.schema
      .createTable("Department", (table) => {
      table
        .string("departmentID", 4).primary()
        /* Department ID: 4-letter department abbreviation */
      table
        .string("departmentName")
        .notNullable(); /* Department Name: Department name */
    })
    .createTable("Course", (table) => {
      table
        .string("courseID")
        .primary() /* Course ID: 4-digit department identifier followed by course number, eg. CSCI0201  */
      table.string("courseName").notNullable(); /* Course Name: Course name */
      table
        .text("courseDescription")
        .notNullable().defaultTo(""); /* Course Description: Course description */
      table.string("departmentID").notNullable(); /* Course Department: Department name */
      table.foreign("departmentID").references("Department.departmentID");
    })
    .createTable("Instructor", (table) => {
      table.string("name").notNullable();
      table.string("slug").unique().notNullable();
      table.string("instructorID").primary();
      table.string("email");
      table.string("departmentID").defaultTo("");
    })
    .createTable("CourseInstructor", (table) => {
      table.string("courseID");
      table.string("instructorID");
      table.string("term", 3).notNullable();

      table
        .foreign("courseID")
        .references("Course.courseID")
        .onDelete("CASCADE");
      table
        .foreign("instructorID")
        .references("Instructor.instructorID")
        .onDelete("CASCADE");
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("CourseInstructor")
    .dropTableIfExists("Course")
    .dropTableIfExists("Instructor")
    .dropTableIfExists("Department");
};
