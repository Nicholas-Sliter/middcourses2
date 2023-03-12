# MiddCourses 2.0
![](https://user-images.githubusercontent.com/78503029/150461477-c6136e55-cc1e-4c25-8fb3-ff1d046dc02d.png)

MiddCourses is available at [https://midd.courses](https://midd.courses) &nbsp;


# About

MiddCourses is an online course review, discovery, and planning tool for Middlebury College students. It is a project of MiddDev, a student organization that aims to build and maintain software that improves the Middlebury experience. This iteration of MiddCourses is a complete rewrite of the original MiddCourses, which was built in 2014 and stopped functioning in 2020.

MiddCourses allows students to discover courses, instructors, and departments. Courses are ranked based on aggregate analysis of course reviews. Instructors and departments are ranked based on the average rating of their courses. Students can also view personalized recommendations for courses based on their previous course reviews.

Each semester, students can submit anonymous reviews of their courses. A review combines ratings of the course and the instructor, as well as a written, holistic review. Writing 2 reviews per semester (calculated as 2 reviews in the last 6 months) is required for a student to be able to view other reviews. This incentivizes students to write reviews. 100-level & FYSE courses are excluded from this requirement and their reviews are visible without any authentication. This allows first-year students to use MiddCourses and should disincentivize students from writing fake reviews.

Middlebury instructors can access all (anonymous) reviews on MiddCourses automatically. We do this by confirming instructor status with the Middlebury Directory. Similarly, we confirm student status with the Middlebury Directory for students when they first login. This ensures only Middlebury students can write reviews.

MiddCourses is a work in progress. We are constantly adding new features and improving the user experience. If you have any suggestions or feedback, please reach out to us at the issues page.


## Review Structure

Each review consists of the following components:

- Course identification (course number, instructor, semester)
- Course review (rating sliders, tags, & components)
- Instructor review (rating sliders)
- Written review (free-form text)

### Course Identification

The course identification section contains the course number, instructor, and semester. It is used to identify the course that the review is about. It also includes an alias selection if the course has multiple aliases.

| Component | Description | Scale |
| --- | --- | --- |
| `courseID` | The course number | Preset from page |
| `semester` | The semester the course was taken | Text selection {Set of semesters the course was offered} |
| `instructorID` | The instructor of the course | Text selection {Set of instructors who taught the course during `semester`} |

![](/resources/README/course-identification.png)

![](/resources/README/alias-identification.png)


### Course Review

The course review contains a set of qualitative and quantitative questions that allow students to rate the course. It includes:

| Component | Description | Scale |
| --- | --- | --- |
| `inMajorMinor` | If the course is in the student's major or minor | Text selection {Major, Minor, Neither} |
| `whyTake` | Why the student took the course | Text selection {...} |
| `difficulty` | How difficult the course was | Slider 1-10 |
| `value` | How valuable the course was | Slider 1-10 |
| `primaryComponents` | The primary components of the course | Tag selection (1-3 tags)|
| `hours` | How many hours per week the student spent on the course outside of class | Number input (0-30) |
| `tags` | Optional tags that the student can add to the review | Tag selection (0-3 tags) |
| `again` | If the student would take the course again | Switch {0,1} |
| `rating` | The student's overall rating of the course (this is the value that is displayed at the top of each review) | Slider 1-10 |

![](/resources/README/course-review.png)



### Instructor Review

The instructor review is a set of rating sliders that allow students to rate the instructor on a scale of 1-10 and two switches that allow students to indicate whether they enjoyed the instructor's teaching style and whether they would take another course with the instructor.

It includes:

| Component | Description | Scale |
| --- | --- | --- |
| `instructorEffectiveness` | How effective the instructor was at teaching the course | Slider 1-10 |
| `instructorEnthusiasm` | How enthusiastic the instructor was about the course | Slider 1-10 |
| `instructorAccommodationLevel` | How accommodating the instructor was to students | Slider 1-10 |
| `instructorEnjoyed` | If the student enjoyed the instructors teaching style  | Switch {0,1} |
| `instructorAgain` | If the student would take another course with the instructor | Switch {0,1} |

![](/resources/README/instructor-review.png)

### Written Review

The written review is a free-form text field that allows students to write a holistic review of the course. It is the most important component of a review as it allows students to provide context and nuance to their ratings.

![](/resources/README/written-review.png)


## Page Structure

### Home Page

The home page is the landing page for MiddCourses. It contains a search bar that allows students to search for courses, instructors, and departments.

### Course Page

The course page contains information about a course and its reviews.

### Instructor Page

The instructor page contains information about an instructor, recent reviews, and a list of the courses they have taught.

### Department Page

The department page contains information about a department, recent reviews, and a list of the courses they offer.

### Discover Page (Rankings & Recommendations)

The discover page contains rankings and recommendations for courses. Rankings are based on aggregate analysis of course reviews. Recommendations are based on a machine learning model that predicts how much a student will like a course based on their previous course reviews. (See [Rankings & Recommendations](#rankings--recommendations) for more info.)



## Rankings & Recommendations


## Review Quality

A great deal of effort goes into ensuring the reviews on MiddCourses are high quality and real. First, reviews require a student to write at minimum 200 characters of text. An NLP-based content filtering system is used as a baseline filter of this text to ensure that it does not contain keyboard-mashing, copy-pasted text, or other fraudulent text. This system is not perfect and is not intended to be. It is a baseline filter that is used to catch the most obvious cases of fraudulent reviews. Next, the reviews are manually reviewed by MiddDev members. This process is also not perfect as we make reviews public upon submission, not manual review. Egregious violations of the review guidelines are caught by this process.  And finally, students can flag reviews that they believe are fraudulent or problematic. This process should, in time, catch most of the remaining fraudulent reviews. We follow the swiss cheese model of security and believe that this combination of automated and manual review is the best way to ensure the quality of the reviews on MiddCourses while maintaining the user-experience.

Occasionally, students will write fake reviews (of courses they never took). These are much harder to detect and are not caught by the automated or manual review processes.  Currently, these reviews are best found by examining consistency in the different questions asked on the review. These students often want to get the process over with as fast as possible and do not put effort into writing their fake review. The review text will look generic and the questions (sliders, tags, etc) will be inconsistent. This allows us to manually detect these reviews by looking at anomalous patterns. If we identity a user submitting such reviews, they are banned from MiddCourses (currently for an indefinite period of time). We are working on an automated solution to this problem but it is not yet implemented.

Within a course page, we sort reviews by a metric that incorporates an estimate of review quality. The purpose of this is to show users high-quality reviews at the top of each course page. This metric is not perfect and is not intended to be. It is a baseline metric that is used to enhance the user-experience. This metric incorporates the following factors:

- Review length
- Review completeness (how many questions were answered, usage of tags, etc)
- Estimated hyperbole (how much the review is exaggerated in positive or negative ways)
- Estimated review quality (based on MSE of review components compared with default review)
- Review votes (upvotes and downvotes from other students)
- Review age (newer reviews are weighted more heavily)

From personal experience, the most relevant feature in review quality seems to be review length. Students who just want to get the review process over with, reach the 200-character minimum and stop writing. Students who intend to write a high-quality review will often write far more than 200 characters.





Reviews are aggregated at the course, instructor, and department level. This allows students to see an overview of how a course, instructor, or department is rated and compare them to other courses, instructors, or departments.




## Features

- Anonymous course reviews
- Course discovery and rankings
- Personalized course recommendations
- Instructor ratings and aggregations
- Department ratings and aggregations
- Course planning* (coming soon)





## Technical Details

Each semester, MiddCourses automatically\* imports course data from the Middlebury Course Catalog (using catalog.js) and verifies instructor data against the Middlebury Directory (using directory.js). 


\* data updates are automated but require manual triggers to run. See [Installation](#installation-production-env) for more info.

## Tech Stack

- Next.js (SSR)
- TypeScript
- React
- PostgreSQL
- Knex.js
- Heroku

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

2. Adjust ENV config vars in Heroku dashboard. (Without quotes).  NEVER share these secrets or commit them to the repo.\
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



## Getting Admin Access (prod or dev)

1. Make an account on your local dev env or prod env.
2. Run ./config/become-admin.sh
3. Follow the instructions to get admin access.




## Contributing




# Contributors

<a href="https://github.com/Nicholas-Sliter/middcourses2/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Nicholas-Sliter/middcourses2" />
</a>

Made with [contrib.rocks](https://contrib.rocks).




# Acknowledgements

- Dana Silver & Teddy Knox for their work on the original MiddCourses
