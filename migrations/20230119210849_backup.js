
exports.up = function (knex) {
    return knex.schema.createTable('Backup', function (table) {
        table.string('key').primary();
        table.text('value').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });

};

exports.down = function (knex) {
    return knex.schema.dropTable('Backup');
};
