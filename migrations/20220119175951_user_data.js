exports.up = function(knex)  {
  return knex.schema.createTable("User", (table) => {
    //add middID here and consider replacing uuid with it
    table
      .uuid("userID")
      .unique()
      .notNullable(); /* User ID: Unique ID for each user */
    table
      .string("userEmail")
      .unique()
      .notNullable(); /* User Email: User email */
    table
    .string("refreshToken")  /* Refresh Token: Refresh token for each user */
    table
      .enum("userType", ["student", "faculty"])
      .notNullable(); /* User Type: One of { student, faculty } */
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
      .string("graduationYear") /* Graduation Year: Graduation year of the user, null when user is an instructor */
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