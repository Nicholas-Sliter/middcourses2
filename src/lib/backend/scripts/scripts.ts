import { Department, public_course } from "../../common/types";
import { Scraper as directoryScraper } from "directory.js";
import departmentsScraper from "departments.js";
import catalogScraper from "catalog.js";
import { getDepartmentByName, getInstructorByID } from "../database-utils";
import { slugify } from "../../common/utils";

//test inteface to simulate data from catalog
interface CourseObject {
  code: string;
  description: string;
  title: string;
  courseNumber: string;
  instructors: {
    rawID: string;
    href: string;
    name: string;
    text: string;
    id: string;
  }[];
}

export async function getRawCoursesData(season: string) {
  const term = season;
  const searchParameters = null;
  const filepath = null;

  const S = new catalogScraper({ term, searchParameters, filepath });
  await S.scrape();
  await S.parse();

  const courses = S.catalog.courses;

  return courses;
}

export async function getCourses(season: string) {
  const courses = await getRawCoursesData(season);

  return await processCourses(courses);
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
    departmentID: rawCourse.courseNumber.substring(0, 4).toUpperCase(),
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
    //skip courses that have an alias set
    //if (rawCourse.alias !== "") {
    //  return;
    //}

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
  email: string;
  departmentID: string;
}

async function fetchInstructorData(rawInstructor: InstructorObject) {
  const formattedInstructor: Instructor = {
    name: rawInstructor.name,
    instructorID: rawInstructor.id,
    slug: slugify(rawInstructor.name),
    email: "",
    departmentID: null,
  };

  try {
    //get department from directory.js using instructor ID
    const directory = new directoryScraper("", rawInstructor.id);
    await directory.init();

    const person = directory.person;

    if (person) {
      formattedInstructor.email = person.email;
      //query the database for the departmentID from the department
      const department =
        (await getDepartmentByName(person.department ?? "")) ?? null; //OTHER /OTHR

      formattedInstructor.departmentID = department.departmentID ?? null;
    }
  } catch (e) {
    //console.error(e);
  }

  return formattedInstructor;
}

export async function processInstructors(rawInstructors: InstructorObject[]) {
  //create dictionary to keep track of duplicate instructors
  //const instructorDict = {};

  //store processed instructors in an array
  const formattedInstructors: Instructor[] = [];
  const indexes = [];

  await Promise.allSettled(
    rawInstructors?.map(async (rawInstructor, index) => {
      //add random delay to not overload the server
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 24000)
      );

      const instructor = await fetchInstructorData(rawInstructor);
      if (!instructor || instructor.name === "") {
        console.log("Error with instructor: ", rawInstructor.id);
      }

      formattedInstructors.push(instructor);
      //console.log("pushed instructor: ", index);
      indexes.push(index);
    })
  );

  console.log("formatted instructors size: ", formattedInstructors.length);
  const sindexes = indexes.sort(function (a, b) {
    return a - b;
  });
  console.log({ sindexes });
  //sort by instructorID
  const sortedInstructors = formattedInstructors.sort((a, b) => {
    return a.instructorID.localeCompare(b.instructorID);
  });
  return sortedInstructors;
}

export async function getInstructors(rawCourses) {
  //get instructors
  const rawInstructors = [];

  rawCourses.forEach((rawCourse) => {
    //courses are pretty flat and should only have 1-3 instructors roughly
    rawCourse.instructors.forEach((instructor) => {
      rawInstructors.push(instructor);
    });
  });

  const instructors = await processInstructors(rawInstructors);
  return instructors;
}
