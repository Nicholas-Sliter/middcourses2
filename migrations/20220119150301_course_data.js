exports.up = function (knex) {
  return knex.schema
    .createTable("Course", (table) => {
      table
        .string("courseID")
        .unique() //should be unique?????
        .notNullable(); /* Course ID: 4-digit department identifier followed by course number, eg. CSCI0201  */
      //table
      //  .string("courseDepartmentID")
      //  .notNullable(); /* Department ID: Department abbreviation (eg. CSCI) */  //TODO: we don't need this as we can parse it from courseID
      table.string("courseName").notNullable(); /* Course Name: Course name */
      table
        .text("courseDescription")
        .notNullable(); /* Course Description: Course description */
    })
    .createTable("Instructor", (table) => {
      table.string("name").notNullable();
      table.string("slug").unique().notNullable();
      table.string("instructorID").unique().notNullable();
      table.string("departmentID");
    })
    .createTable("CourseInstructor", (table) => {
      table.string("courseID").notNullable();
      table.string("instructorID").notNullable();
      table.string("term", 3).notNullable();
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
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("Course")
    .dropTableIfExists("Instructor")
    .dropTableIfExists("CourseInstructor")
    .dropTableIfExists("Department");
};
