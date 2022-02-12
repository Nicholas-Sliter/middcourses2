exports.up = function(knex)  {
  return knex.schema.createTable("User", (table) => {
    table
      .uuid("userID")
      .unique()
      .notNullable(); /* User ID: Unique ID for each user */
    table
      .string("userEmail")
      .notNullable(); /* User Email: User email */
    table
      .enum("userType", ["student", "instructor"])
      .notNullable(); /* User Type: One of { student, professor } */
    table.string("major"); /* Major: Major of the student */
    table
      .boolean("admin")
      .notNullable()
      .defaultTo(false); /* Admin: Whether the user is an admin */
    table
      .boolean("banned")
      .notNullable()
      .defaultTo(false); /* Banned: Whether the user is banned */
    table
      .integer("numReviews")
      .notNullable()
      .defaultTo(0); /* Num Reviews: Number of reviews the user has written */
    table
      .string("graduationYear")
      .notNullable(); /* Graduation Year: Graduation year of the user */
    table
      .boolean("canReadReviews")
      .notNullable()
      .defaultTo(false); /* Can Read Reviews: Whether the user can read reviews, true if numReviews > 2 or is first semester firstyear */
    table.date("createdAt").notNullable();
  });
}

exports.down = function(knex){
  return knex.schema.dropTableIfExists("User");
}