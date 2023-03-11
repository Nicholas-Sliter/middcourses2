
const DATABASE_CONFIG_NAME = process.env.DATABASE_CONFIG_NAME;
const DATABASE_URL = process.env[DATABASE_CONFIG_NAME] || process.env.DATABASE_URL;

module.exports = {
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
    }
  },
  production: {
    client: "postgresql",
    connection: {
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "seeds-cannot-run-in-production", /* This is a hack to prevent knex from running seeds in production */
    }
  }
};
