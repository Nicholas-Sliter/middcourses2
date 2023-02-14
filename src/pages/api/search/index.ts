import Fuse from "fuse.js";
import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { searchCourses, searchInstructors } from "../../../lib/backend/database-utils";
import { searchDepartments } from "../../../lib/backend/database/departments";
import { cleanString, parseCourseID } from "../../../lib/common/utils";


const handler = nc({
  onError: (err, req: NextApiRequest, res: NextApiResponse) => {
    console.log(err.stack);
    res.status(500).end("Something went wrong");
  },
  onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
    res.status(404).end();
  }
})



  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const q = req.query.q as string;

    if (!q) {
      res.status(400).end("No query provided");
      return;
    }

    //clean the query and take only the first 24 characters
    const query = cleanString(q).substring(0, 24);

    const [courses, instructors, departments] = await Promise.all([
      searchCourses(query),
      searchInstructors(query),
      searchDepartments(query)
    ]);


    //do sorting here and return a combined array of courses and instructors and departments sorted by relevance (use fuse.js)
    //return the top 50 results

    const results = [];

    courses.forEach((course) => {
      const { department, courseNumber } = parseCourseID(course.courseID);
      results.push({
        ...course,
        departmentID: department,
        courseNumber: `${parseInt(courseNumber, 10)}`, /* cast to int and back to remove left 0s */
        courseLevel: `${Math.min(Math.round(parseInt(courseNumber) / 100) * 100, 1000)}`,
        type: "course"
      });

    });

    instructors.forEach((instructor) => {
      results.push({
        ...instructor,
        type: "instructor"
      });
    });

    departments.forEach((department) => {
      results.push({
        ...department,
        type: "department"
      });
    });

    const keys = (type: string) => {
      switch (type) {
        case "course":
          return [
            { name: "courseID", weight: 3 },
            { name: "courseName", weight: 2 },
            "departmentID",
            "courseNumber",
            "courseLevel",
            "courseDescription"
          ];
        case "instructor":
          return [{ name: "name", weight: 3 }, "departmentID"];
        case "department":
          return [{ name: "departmentID", weight: 2 }, "departmentName"];
      }
    };

    /* 
    we want to sort the results by relevance, so we use fuse.js to do that
    note: we are sorting a limited subset of the results, so we don't need 
    to worry about performance
    */

    const fuseBuilder = (type: string) => {
      return new Fuse(results.filter((result) => result.type === type), {
        keys: keys(type),
        threshold: 0.7,
        includeScore: true,
        shouldSort: true,
        minMatchCharLength: 2,
        isCaseSensitive: false,
      });
    };



    /* Precedence order if two results have the same score:
    * 1. Department
    * 2. Course
    * 3. Instructor
    */

    const DEPARTMENT_SCORE_MULTIPLIER = 1000; /* improves sort score of depts so they are more likely to be at the top */

    const orderedCourses = fuseBuilder("course").search(query).map((result) => {
      return {
        ...result.item,
        score: result.score
      }
    });
    const orderedInstructors = fuseBuilder("instructor").search(query).map((result) => {
      return {
        ...result.item,
        score: result.score
      }
    });
    const orderedDepartments = fuseBuilder("department").search(query).map((result) => {
      return {
        ...result.item,
        score: result.score / DEPARTMENT_SCORE_MULTIPLIER
      }
    });


    /* Lower score is better */
    const orderedResults = [...orderedDepartments, ...orderedInstructors, ...orderedCourses].sort((a, b) => {
      if (a.score === b.score) {
        if (a.type === "department") {
          return -1;
        } else if (b.type === "department") {
          return 1;
        } else if (a.type === "course") {
          return -1;
        } else if (b.type === "course") {
          return 1;
        } else {
          return 0;
        }
      } else {
        return a.score - b.score;
      }
    });

    const limitedResults = orderedResults.slice(0, 50).map((result) => {

      if (result.type === "course") {
        delete result.courseDescription; /* too long to send over network */
        delete result.courseNumber; /* not needed, can reparse */
        delete result.departmentID;
        delete result.courseLevel;
      }
      delete result.score;
      return result;

    });


    return res.status(200).json({ results: limitedResults });

  });



export default handler;
