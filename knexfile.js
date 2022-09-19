module.exports = {
  // development: {
  //   client: "sqlite3",
  //   connection: {
  //     filename: "./dev.sqlite3",
  //   },
  //   useNullAsDefault: true
  // },

  development: {
    client: "postgresql",
    connection: {
      database: "middcourses_dev",
      user: "postgres",
      password: "dev",
    },
    pool: {
      min: 0,
      max: 1,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },

  staging: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },

  production: {
    client: "postgresql",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
