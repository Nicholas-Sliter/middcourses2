import { Department, public_course } from "../common/types";
import { Scraper as directoryScraper } from "directory.js";
import departmentsScraper from "departments.js";
import catalogScraper from "catalog.js";

//test inteface to simulate data from catalog
interface CourseObject {
  code: string;
  description: string;
  title: string;
  courseNumber: string;
}

export async function getCourses(season: string) {
  const term = season;
  const searchParameters = null;
  const filepath = null;

  const S = new catalogScraper({ term, searchParameters, filepath });
  await S.scrape();
  await S.parse();

  console.log(S.catalog.courses.length);

  const courses = S.catalog.courses;

  return processCourses(courses);
}

export async function getBaseData() {
  //use previous 3 terms
  const terms = ["S21", "F21", "W22", "S22"];

  const scrapers = [];

  terms.forEach((term) => {
    const S = new catalogScraper({
      term: term,
      searchParameters: null,
      filepath: null,
    });
    scrapers.push(S);
  });

  await Promise.all(
    scrapers.map(async (S) => {
      await S.scrape();
    })
  );


  await Promise.all(
    scrapers.map(async (S) => {
      await S.parse();
    })
  );

  const courses = [];

  scrapers.forEach((S) => {
    courses.push(...S.catalog.courses);
  });

  //do instructor processing and stuff


  //change to return raw courses
  return processCourses(courses);
  
}

//get course data from course object
function formatCourse(rawCourse: CourseObject) {
  const formattedCourse: public_course = {
    courseDescription: rawCourse.description,
    courseID: rawCourse.courseNumber,
    courseName: rawCourse.title,
  };

  return formattedCourse;
}

/**
 * Process course data from catalog.js into a format that can be inserted into the database
 * @param rawCourses
 * @returns an array of processed courses that can be added to the database
 */
export function processCourses(rawCourses: CourseObject[]) {
  //create a dictionary to keep track of duplicate courses
  const courseDict = {};

  //initialize array of formatted courses
  const formattedCourses: public_course[] = [];

  rawCourses.forEach((rawCourse) => {
    const formattedCourse = formatCourse(rawCourse);
    const name = formattedCourse.courseID;

    if (!courseDict[name]) {
      courseDict[name] = 1;
      formattedCourses.push(formattedCourse);
    }
  });

  return formattedCourses;
}

export async function getDepartmentsData(term: string) {
  const S = new departmentsScraper(term);
  await S.init();

  return S.departments;
}

interface rawDepartment {
  code: string;
  name: string;
}

export async function processDepartmentsData(season: string) {
  const rawDepartments: rawDepartment[] = await getDepartmentsData(season);
  //create dictionary to keep track of duplicate departments
  const departmentDict = {};

  //store processed departments in an array
  const formattedDepartments: Department[] = [];

  rawDepartments.forEach((rawDepartment) => {
    const department = {
      departmentID: rawDepartment.code,
      departmentName: rawDepartment.name,
    };

    if (!departmentDict[rawDepartment.code]) {
      departmentDict[rawDepartment.code] = 1;
      formattedDepartments.push(department);
    }
  });

  return formattedDepartments;
}

//test interface in order to simulate data from catalog
interface InstructorObject {
  id: string;
  name: string;
}

//interface to store instructor data in database
interface Instructor {
  name: string;
  slug: string;
  instructorID: string;
  departmentID: string;
}

async function getInstructorData(rawInstructor: InstructorObject) {
  let formattedInstructor: Instructor;

  formattedInstructor.name = rawInstructor.name;

  formattedInstructor.instructorID = rawInstructor.id;

  //gets person from directory by looking up their id
  const S = new directoryScraper("", formattedInstructor.instructorID);
  await S.init();
  const department = S.person.department; //this gets department name,  NOT departmentID, but I am using this a placeholder until a name-department ID dictionary can be implemented

  formattedInstructor.departmentID = department;

  return formattedInstructor;
}

function processInstructors(rawInstructors: InstructorObject[]) {
  //create dictionary to keep track of duplicate instructors
  const instructorDict = {};

  //store processed instructors in an array
  const formattedInstructors: Instructor[] = [];

  rawInstructors.forEach(async (rawInstructor) => {
    const formattedInstructor = await getInstructorData(rawInstructor);

    const ID = formattedInstructor.instructorID;

    if (!instructorDict[ID]) {
      instructorDict[ID] = 1;

      formattedInstructors.push(formattedInstructor);
    }
  });

  return formattedInstructors;
}
