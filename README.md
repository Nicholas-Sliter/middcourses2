# MiddCourses 2.0
![](https://user-images.githubusercontent.com/78503029/150461477-c6136e55-cc1e-4c25-8fb3-ff1d046dc02d.png)

MiddCourses is available at [https://midd.courses](https://midd.courses) &nbsp;


## About

MiddCourses is an online course review, discovery, and planning tool for Middlebury College students. It is a project of MiddDev, a student organization that aims to build and maintain software that improves the Middlebury experience. This iteration of MiddCourses is a complete rewrite of the original MiddCourses, which was built in 2014 and stopped functioning in 2020.


# Getting Started

## Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [TypeScript](https://www.typescriptlang.org/download)
- [PostgreSQL](https://www.postgresql.org/download/)

## Installation (Local Development ENV)

1. Clone the repo
   ```
   git clone https://github.com/Nicholas-Sliter/middcourses2
    ```

2. Install NPM packages
    ```
    npm ci
    ```

3. Start PostgreSQL server
    ```
    pg_ctl -D /usr/local/var/postgres start
    ```
    or use the start-postgres.bat file (windows)

4. Create a database
    ```
    npx knex migrate:latest
    ```
5. Seed the database
    ```
    npx knex seed:run
    ```
6. Start the server
    ```
    npm run dev
    ```
7. Access the site at http://localhost:3000


## Installation (Production ENV)
Note: Product ENV is already setup on Heroku. This is for reference only.

Warning: Here be dragons. Do not modify the production env unless you know what you are doing.

1. Heroku auto deploys from the main branch. Push to main to deploy & build.

2. Adjust ENV config vars in Heroku dashboard. (Without quotes)
  - `DATABASE_CONFIG_NAME` - "HEROKU_POSTGRESQL_SILVER_URL"\
  - `HEROKU_APP_NAME` - "middcourses2"\
  - `HOST_NAME` - "midd.courses"\
  - `NEXTAUTH_URL` - "https://midd.courses"\
  - `HEROKU_POSTGRESQL_SILVER_URL` - **SECRET**: Heroku Postgres DB URL, managed by Heroku\
  - `INTERNAL_AUTH` - **SECRET**: A long random string to authenticate internal requests\
  - `NEXTAUTH_SECRET` - **SECRET**: NextAuth secret\
  - `PAPERTRAIL_API_TOKEN` - **SECRET**: Papertrail API Token\
  - `GOOGLE_CLIENT_ID` - **SECRET**: Google OAuth Client ID\
  - `GOOGLE_CLIENT_SECRET` - **SECRET**: Google OAuth Client Secret\

3. Run migrations (if they have changed)
  - Note: This step is only necessary if the database needs to be updated.
  - Warning: NEVER migrate:down or migrate:rollback. This will **destroy** the production database.
  - It is advised to create a backup before running migrations.
    ``` 
    heroku pg:backups:capture --app middcourses2
    ```
  - If you need to restore a backup, run the following command
    ```
    heroku pg:backups:restore DATABASE_URL --app middcourses2
    ```
  - Otherwise
    ```
    heroku run npx knex migrate:latest --app middcourses2
    ```
4. Import data (if necessary).
  - Note: This step is only necessary if the database needs to be updated or if the database is empty.
  - Warning: Do not seed the database. This will overwrite the production data.
  - MiddCourses includes an automated data pipeline. Curl ```
      https://midd.courses/api/jobs/update/data?semester=<TERM>``` 
      with the authentication header set to `INTERNAL_AUTH` to trigger the data pipeline.
  - Replace `<TERM>` with the term you want to update. For example, `F21` for Fall 2021, `S21` for Spring 2021, etc.
4. Otherwise everything should be good to go.














## Contributing




# Contributors

<a href="https://github.com/Nicholas-Sliter/middcourses2/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Nicholas-Sliter/middcourses2" />
</a>

Made with [contrib.rocks](https://contrib.rocks).
