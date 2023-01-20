
exports.up = function (knex) {

    /**
     * @column courseID - is the primary course that is referenced by an alias course
     * @column aliasID - is the alias course that references the primary course
     */
    return knex.schema
        .createTable("Alias", (table) => {
            table.string("courseID").notNullable();
            table.string("aliasID").notNullable();
            table.primary(["courseID", "aliasID"]);
            table.foreign("courseID").references("courseID").inTable("Course");
            table.foreign("aliasID").references("courseID").inTable("Course");
        })

};

exports.down = function (knex) {

    return knex.schema
        .dropTable("Alias");
};
