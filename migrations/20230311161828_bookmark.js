
exports.up = function (knex) {

    return knex.schema.createTable('Bookmark', function (table) {
        table.uuid('userID').notNullable();
        table.foreign('userID').references('User.userID');
        table.string('courseID').notNullable();
        table.foreign('courseID').references('Course.courseID');
        table.timestamp('createdAt').defaultTo(knex.fn.now());

        table.primary(['userID', 'courseID']);
    });

};

exports.down = function (knex) {

    return knex.schema.dropTable('Bookmark');

};
