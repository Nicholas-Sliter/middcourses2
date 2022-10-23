import { public_course } from "./types";

/**
 * Get the current graduation year of first semester freshmen based on the current date.
 */
export function getFirstSemesterGraduationYear(): string {
  const date = new Date();
  let year = date.getFullYear() + 4;

  //febs
  year = date.getMonth() < 7 ? year + 0.5 : year;

  return year.toString();
}

export const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function isUUIDv4(id: string) {
  if (id.length !== 36) {
    return false;
  }
  const re =
    /^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}$/i;
  return re.test(id);
}

export function checkIfFirstSemester(graduationYear: string) {
  if (graduationYear === getFirstSemesterGraduationYear()) {
    return true;
  }

  return false;
}

export function getCurrentSemester() {
  const date = new Date();
  const month = date.getMonth();
  let semester = "";
  if (month < 2) {
    semester = "Winter";
  } else if (month < 6) {
    semester = "Spring";
  } else if (month < 9) {
    semester = "Summer";
  } else {
    semester = "Fall";
  }

  return semester;
}

export const departmentNameMapping = {
  "Computer Science": "CSCI",
};

export function cleanString(str: string) {
  return str.replace(/[^a-zA-Z0-9 ]/g, "");
}

export const slugify = (text) => {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

export const primaryComponents = [
  "Exams",
  "Projects",
  "Papers",
  "Research",
  "Lab/Fieldwork",
  "Discussions",
  "Homework",
  "Lectures",
  "Screenings",
  "Presentations",
  "Readings",
  "Group work"

];


export const courseTags = [
  // "Amazing Lectures",
  // "Exams are Easy",
  // "Difficult Exams",
  // "Lots of Work",
  // "Lots of Reading",
  // "Lots of Writing",
  // "Lots of Homework",
  // "High Expectations",
  // "Project Heavy",
  // "Must Take",
  // "Avoid",
  // "Super Fun",
  // "Super Boring",
  // "Clear Grading Criteria",
  // "Fair Grading",
  // "Group Work",
  // "Ungrading",
  // "Tough Grading",
  // "Easy Grading",
  // "Accessible Instructor",
  ...["Fast-Paced", "Chill and Relaxed", "Slow-Paced"],
  // ...["Small Class Size", "Medium Class Size", "Large Class Size"],
  ...["Project-Heavy", "Lots of Homework", "Constant Reading", "Endless Writing"],
  ...["Tough Grading", "Fair Grading", "Easy Grading", "Ungrading"],
  ...["Difficult Exams", "Easy Exams", "Project Exams", "No Exams"],

];



export function formatTermObj(termObj) {
  const term: string = `${termObj.season}${termObj.year.toString().slice(2)}`;
  return term;
}


export function getCourseNumberFromID(courseID: string) {
  return courseID.split(/[0-9]/)[1];
}


export function sortCoursesByTerm(courses: public_course[]) {
  const insertIfS = (x: string) => (x.includes("S") ? `${x}b` : x);
  const insertIfF = (x: string) => (x.includes("F") ? `${x.replace("F", "S")}c` : x);
  const insertIfW = (x: string) => (x.includes("W") ? `${x.replace("W", "S")}a` : x);

  //sort by term
  const sorted = courses.sort((a, b) => {
    const aTerm = insertIfW(insertIfF(insertIfS(a.term)));
    const bTerm = insertIfW(insertIfF(insertIfS(b.term)));

    return (aTerm > bTerm) ? 1 : -1;
  });

  return sorted.reverse();
}

export function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    function (txt: string) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

export function isValidCourseID(courseID: string) {
  if (!courseID) {
    return false;
  }
  //is of form ABCD0123 or _ABC0123
  const re = /^([A-Z]{4}[0-9]{4}|_[A-Z]{3}[0-9]{4})$/;
  return re.test(courseID.toUpperCase());
}

export function parseCourseID(courseID: string) {
  if (!courseID) {
    return { courseNumber: null, department: null };
  }
  try {
    const department = courseID.split(/[0-9]/)[0];
    const courseNumber = courseID.slice(-4);
    return { courseNumber, department };
  } catch (e) {
    return { courseNumber: null, department: null }; //invalid courseID
  }
}


export function is100LevelCourse(courseID: string) {
  const { courseNumber } = parseCourseID(courseID);
  return courseNumber.startsWith("01");
}


export function isInMajorMinorText(str: string) {
  return str?.includes("Major") || str?.includes("Minor");
}

export function isNeitherText(str: string) {
  return str?.includes("Neither") ?? false;
}