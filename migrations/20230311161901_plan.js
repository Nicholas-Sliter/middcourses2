
exports.up = function (knex) {

    return knex.schema
        .createTable('Plan', function (table) {
            table.increments('id').primary();
            table.uuid('userID').notNullable();
            table.foreign('userID').references('User.userID');

            table.string('semester').notNullable();
            table.timestamp('createdAt').defaultTo(knex.fn.now());



        })
        /**
         * CatalogCourses is a table that contains a copy of the catalog data for a course.
         * We have a separate table for this because the catalog data is large and we don't generally need it.
         * We only need it when a user adds a course to their plan so they can schedule it.
         * 
         * We will keep only the current and next semester's catalog data in this table.
         * 
         * This table is deliberately denormalized. We have a limited number of rows on Heroku.
         */
        .createTable('CatalogCourse', function (table) {
            table.string('catalogCourseID').primary();
            table.string("crn").notNullable(); /* CRN is unique within a semester, so it cannot be a pk */
            table.string("semester");

            table.string("section");


            table.string('courseID').notNullable(); /* Reference to Course.courseID even if course is lab/discussion */
            table.foreign('courseID').references('Course.courseID');

            table.json("times"); //TODO: should time be a separate table? (then we can query for courses at a certain time IE recommend a course to fill a time slot)
            // A: This is defintly easier to do in JS by quering the time field.

            table.boolean("isLinkedSection").defaultTo(false); /* If true, this is a lab or discussion section or similar */

            table.specificType('instructors', 'text ARRAY'); /* List of instructor IDs for this section */
            table.specificType('requirements', 'text ARRAY'); /* List of requirements this course satisfies, eg. SOC or DED */

        })
        // /**
        //  * LinkedCourse is a table that contains a mapping between a course and a linked section like a lab or discussion.
        //  */
        // .createTable("LinkedCourse", function (table) {
        //     table.string('courseID').notNullable();
        //     table.foreign('courseID').references('Course.courseID');

        //     table.string('linkedCatalogCourseID').notNullable();
        //     table.foreign('linkedCatalogCourseID').references('CatalogCourses.catalogCourseID');
        // })
        .createTable('PlanCourse', function (table) {

            table.string('catalogCourseID').primary();
            table.foreign('catalogCourseID').references('CatalogCourse.catalogCourseID');

            table.string('courseID').notNullable();
            table.foreign('courseID').references('Course.courseID');

            table.integer('planID').notNullable();
            table.foreign('planID').references('Plan.id');

        });


};

exports.down = function (knex) {

    return knex.schema
        // .dropTable('LinkedCourse')
        .dropTable('CatalogCourses')
        .dropTable('PlanCourse')
        .dropTable('Plan');


};
