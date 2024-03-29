import { Department, public_course } from "../../common/types";
import { Scraper as directoryScraper } from "directory.js";
import departmentsScraper from "departments.js";
import catalogScraper from "catalog.js";
import Param from 'catalog.js/lib/classes/Param.js';
import { getDepartmentByName, getInstructorByID } from "../database-utils";
import { processInstructors, processCourses } from "./scripts";
import { DEPARTMENT_PADDING_PREFIX } from "../utils";
import fs from "fs";
import { formatTermObj } from "../../common/utils";

export default async function getBaseData() {
  //use previous 4 terms
  const terms = ["S21", "F21", "W22", "S22", "F22", "W23"];

  const scrapers = [];

  const searchParameters = [
    new Param("type%5B%5D", "genera%3Aoffering%2FLCT").getObject(),
    new Param("type%5B%5D", "genera%3Aoffering%2FLAB").getObject(),
    new Param("type%5B%5D", "genera%3Aoffering%2FDSC").getObject(),
    new Param("type%5B%5D", "genera%3Aoffering%2FDR1").getObject(),
    new Param("type%5B%5D", "genera%3Aoffering%2FDR2").getObject(),
    //new Param("type%5B%5D", "genera%3Aoffering%2FPE").getObject(), //
    new Param("type%5B%5D", "genera%3Aoffering%2FPLB").getObject(),
    new Param("type%5B%5D", "genera%3Aoffering%2FSCR").getObject(),
    new Param("type%5B%5D", "genera%3Aoffering%2FSEM").getObject(),
    new Param("location%5B%5D", "resource%2Fplace%2Fcampus%2FM").getObject(),
    new Param("search", "Search").getObject(),
  ];

  terms.forEach((term) => {
    const S = new catalogScraper({
      term: term,
      searchParameters,
      filepath: null,
    });
    scrapers.push(S);
  });

  console.log("getting courses");
  await Promise.all(scrapers.map((S) => S.scrape()));
  await Promise.all(scrapers.map((S) => S.parse()));

  //const courses = scrapers.map((S) => S.catalog.courses);
  const courses = scrapers.reduce((acc, S) => {
    return acc.concat(S.catalog.courses);
  }, []);

  console.log("courses size: ", courses.length);
  //console.log(courses.find((course) => course.courseNumber.slice(0,4) === "PHED"));
  const formattedCourses = processCourses(courses);

  console.log("formatted courses size: ", formattedCourses.length);

  //get courseinstructor data, list of instructors and course + term
  console.log("getting courseinstructor data");
  const courseInstructors = courses.reduce((acc, cur) => {
    const instructors = cur.instructors
      .map((i) => ({
        instructorID: i.id,
      }))
      .reduce((acc, cur) => {
        //unique instructors by course and term
        if (!acc.find((i) => (i.instructorID === cur.instructorID))) {
          acc.push(cur);
        }
        return acc;
      }, []);

    const ci = instructors.map((i) => ({
      courseID: cur.courseNumber,
      term: formatTermObj(cur.term),
      instructorID: i.instructorID,
    }));

    return [...acc, ...ci];
  }, []);

  //dedupe courseinstructor data by courseID, instructorID, term
  console.log("deduping courseinstructor data");
  const dedupedCourseInstructors = courseInstructors.reduce((acc, cur) => {
    if (!acc.find((i) => (i.courseID === cur.courseID && i.instructorID === cur.instructorID && i.term === cur.term))) {
      acc.push(cur);
    }
    return acc;
  }, []);



  //get instructors from course data
  console.log("getting instructors");
  const instructors = courses.reduce((acc, cur) => {
    const instructors = cur.instructors.map((i) => ({
      id: i.id,
      name: i.name,
    }));

    return [...acc, ...instructors];
  }, []);

  console.log("instructors size: ", instructors.length);
  //get unique instructors by ID
  const dedupedInstructors = instructors.reduce((acc, cur) => {
    const instructor = acc.find((i) => i.id === cur.id);
    if (instructor) {
      const index = acc.indexOf(instructor);
      acc[index] = cur;
    } else {
      acc.push(cur);
    }
    return acc;
  }, []);

  console.log("deduped instructors size: ", dedupedInstructors.length);

  //process instructors, returning name, slug, instructor id, and department id
  //departmnet id requires a network request using directoryScraper and the instructor id
  console.log("processing instructors");
  const processedInstructors = await processInstructors(dedupedInstructors);

  console.log("processed instructor size: ", processedInstructors.length);

  // //write to debug file
  // fs.writeFileSync(
  //   "./src/lib/backend/data/debug/instructors.json",
  //   JSON.stringify(processedInstructors, null, 2)
  // );

  // //write deduped instructors to debug file
  // fs.writeFileSync(
  //   "./src/lib/backend/data/debug/dedupedInstructors.json",
  //   JSON.stringify(dedupedInstructors, null, 2)
  // );


  //get department list using departmentsScraper
  const departments = [];
  console.log("getting departments");
  terms.forEach(async (term) => {
    const DS = new departmentsScraper({
      term,
      DEPARTMENT_PADDING_PREFIX,
    });

    await DS.init();
    departments.push(...DS.departments);
  });

  //dedupe departments by department code
  console.log("deduping departments");
  const dedupedDepartments = departments.reduce((acc, cur) => {
    const department = acc.find((d) => d.departmentID === cur.departmentID);
    if (department) {
      const index = acc.indexOf(department);
      acc[index] = cur;
    } else {
      acc.push(cur);
    }
    return acc;
  }, []);

  //format departments obj to match database
  console.log("formatting departments");
  const formattedDepartments = dedupedDepartments.map((department) => ({
    departmentID: department.code,
    departmentName: department.name,
  }));

  console.log({ formattedDepartments });

  console.log("writing to files");
  //save to file
  console.log("writing courses");
  fs.writeFileSync(
    "./src/lib/backend/data/courses.json",
    JSON.stringify(formattedCourses, null, 2)
  );

  console.log("writing courseinstructors");
  fs.writeFileSync(
    "./src/lib/backend/data/courseInstructors.json",
    JSON.stringify(dedupedCourseInstructors, null, 2)
  );

  console.log("writing instructors");
  fs.writeFileSync(
    "./src/lib/backend/data/instructors.json",
    JSON.stringify(processedInstructors, null, 2)
  );

  console.log("writing departments");
  fs.writeFileSync(
    "./src/lib/backend/data/departments.json",
    JSON.stringify(formattedDepartments, null, 2)
  );
}
