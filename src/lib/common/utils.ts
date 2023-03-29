import { public_course, public_review } from "./types";

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
  const month = date.getMonth(); // 0-11
  const day = date.getDate(); // 1-31
  let semester = "";
  if (month < 1 || (month === 1 && day < 5)) {
    semester = "Winter";
  } else if (month < 5) {
    semester = "Spring";
  } else if (month < 8) {
    semester = "Summer";
  } else {
    semester = "Fall";
  }

  return semester;
}

export function getCurrentTerm() {
  const year = new Date().getFullYear();
  const semester = getCurrentSemester();

  const yearAbbr = year.toString().slice(2, 4);

  let term = "";
  if (semester === "Winter") {
    term = `W${yearAbbr}`;
  }
  if (semester === "Spring") {
    term = `S${yearAbbr}`;
  }
  if (semester === "Summer") {
    term = `F${yearAbbr}`;  // TODO: Summer term is not yet supported
  }
  if (semester === "Fall") {
    term = `F${yearAbbr}`;
  }

  return term;
}


export function getNextTerm() {
  const term = getCurrentTerm();

  const year = parseInt(term.slice(1, 3));
  const semester = term.slice(0, 1);

  let nextTerm = "";
  if (semester === "W") {
    nextTerm = `S${year}`;
  }
  if (semester === "S") {
    nextTerm = `F${year}`;
  }
  if (semester === "F") {
    nextTerm = `W${year + 1}`;
  }

  return nextTerm;
}


/**
 * @param term of the form W21, S21, F21 (etc)
 * @returns boolean if we are at least 2/3 through the semester
 */
export function areWeTwoThirdsThroughSemester(term: string) {
  const date = new Date();
  const month = date.getMonth();
  const year = date.getFullYear();

  const yearAbbr = year.toString().slice(2, 4);

  const currentTerm = getCurrentTerm();

  if (compareTerm(term, currentTerm) < 0) {
    return true; // term in the past
  }

  if (compareTerm(term, currentTerm) > 0) {
    return false; // term in the future
  }

  /* Then term === currentTerm */

  if (term.startsWith("W")) {
    return (month >= 1) || (month === 0 && date.getDate() >= 20);
  }

  if (term.startsWith("S")) {
    return (month >= 4) || (month === 3 && date.getDate() >= 10); // Early April since Fall Registration is in late April
  }

  if (term.startsWith("F")) {
    return (month >= 10) || (month === 9 && date.getDate() >= 20); // Late October since Winter/Fall Registration is in early November
  }


  return false;

}


/**
 * Determines if a course is too old to review
 * @param term of the form W21, S21, F21 (etc)
 * @returns boolean if a semester is too old to review
 */
export function isSemesterTooOld(term: string) {
  const MAX_REVIEW_AGE = 3; // in years

  const date = new Date();
  const year = date.getFullYear();

  const minYear = year - MAX_REVIEW_AGE;

  const currentTerm = getCurrentTerm();
  const currentSeason = currentTerm.slice(0, 1);

  const minTerm = `${currentSeason}${minYear.toString().slice(2, 4)}`;

  return compareTerm(term, minTerm) < 0;

}



export const departmentNameMapping = {
  "Computer Science": "CSCI",
};

export function cleanString(str: string) {
  return str.replace(/[^a-zA-Z0-9 ]/g, "");
}

export const slugify = (text: string) => {
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


export function compareTerm(termA: string, termB: string) {
  /*  ORDER:
  Ex. W21, S21, F21 -> W22, S22, F22 -> etc.
  */

  const yearA = parseInt(termA.slice(1, 3));
  const yearB = parseInt(termB.slice(1, 3));

  if (yearA > yearB) {
    return 1;
  }

  if (yearA < yearB) {
    return -1;
  }

  const seasonA = termA.slice(0, 1);
  const seasonB = termB.slice(0, 1);

  const order = ["W", "S", "F"];


  if (order.indexOf(seasonA) > order.indexOf(seasonB)) {
    return 1;
  }

  if (order.indexOf(seasonA) < order.indexOf(seasonB)) {
    return -1;
  }

  return 0;

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

export function isFYSECourse(courseID: string) {
  const { department } = parseCourseID(courseID);
  return department === "FYSE";
}


export function isInMajorMinorText(str: string) {
  return str?.includes("Major") || str?.includes("Minor");
}

export function isNeitherText(str: string) {
  return str?.includes("Neither") ?? false;
}


//This function is necessarily duplicated
export const departmentCodeChangedMapping = (code: string, returnCase: "upper" | "lower" = "upper") => {
  let ret: string = "";
  switch (code.toUpperCase()) {
    case "ENAM": //English & American Literatures => English (2022)
      ret = "ENGL";
      break;
    case "GEOL": //Geology => Earth & Climate Sciences (2022)
      ret = "ECSC";
      break;
    default:
      ret = code;
      break;
  }

  return returnCase === "upper" ? ret.toUpperCase() : ret.toLowerCase();
};

export const negativeReviewColumns = [
  "difficulty",
  // "hours",
];

export const postiveReviewColumns = [
  "value",
  "rating",
  "again",
  "instructorAgain",
  "instructorEnthusiasm",
  "instructorEnjoyed",
  "instructorAccommodationLevel",
  "instructorEffectiveness",
];


export const booleanColumns = [
  "again",
  "instructorAgain",
  "instructorEnjoyed"
]

/**
 * Detect low-effort reviews (ie leave all sliders at 5)
 * Use MSE to detect low-effort reviews
 */

export function isLowEffort(review: public_review) {

  const columnBaseValue = {
    difficulty: 5,
    value: 5,
    rating: 5,
    hours: 0,
    again: 0,

    instructorEffectiveness: 5,
    instructorEnthusiasm: 5,
    instructorAccommodationLevel: 5,
    instructorAgain: 0,
    instructorEnjoyed: 0,
  };

  const columns = [...postiveReviewColumns, ...negativeReviewColumns];
  const mse = columns
    .map((column) => Math.pow(review[column] - columnBaseValue[column], 2))
    .reduce((a, b) => a + b, 0) / columns.length;

  const threshold = 1;
  return mse < threshold;

}

// should we use mse or variance? or magnitude?
// check if review is hyperbolic
export function isOverlyNegative(review: public_review) {

  const columnNegativeValues = {
    difficulty: 10,
    value: 1,
    rating: 1,
    hours: 0,
    again: 0,

    instructorEffectiveness: 1,
    instructorEnthusiasm: 1,
    instructorAccommodationLevel: 1,
    instructorAgain: 0,
    instructorEnjoyed: 0,
  };


  const columns = [...postiveReviewColumns, ...negativeReviewColumns];
  const mse = columns
    .map((column) => Math.pow(review[column] - columnNegativeValues[column], 2))
    .reduce((a, b) => a + b, 0) / columns.length;

  const threshold = 1;
  return mse < threshold;

};


/**
 * Returns a number score for the relevance of a review
 * Based on review, votes, homogeneity, and dates
 * @param review 
 * 
 */
export function getReviewRelevanceScore(review: public_review): number {
  const { votes, userVoteType } = review;
  const { reviewDate } = review;

  const reviewIsLowEffort = isLowEffort(review);
  const reviewIsOverlyNegative = isOverlyNegative(review);
  const reviewHasLongContent = review.content.length > 256;
  const reviewHasVeryLongContent = review.content.length > 512;

  /* Review Order is Personalized */
  const baseScore = 10;
  const lowEffortRatingPenalty = -10;
  const overlyNegativeRatingPenalty = -10;
  const negativeRatingPenalty = -100;
  const positiveRatingBonus = 5;

  let score = baseScore + (votes * 3);

  if (userVoteType === -1) {
    score += negativeRatingPenalty;
  } else if (userVoteType === 1) {
    score += positiveRatingBonus;
  }

  if (reviewIsLowEffort) {
    score += lowEffortRatingPenalty;
  }

  if (reviewIsOverlyNegative) {
    score += overlyNegativeRatingPenalty;
  }

  if (reviewHasLongContent) {
    score += 5;
  }

  if (reviewHasVeryLongContent) {
    score += 2;
  }

  const today = new Date();
  const reviewAsDate = new Date(reviewDate);
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const numberOfWeeksAgo = Math.floor((today.getTime() - reviewAsDate.getTime()) / oneWeek);

  const weekAgePenalty = -0.1; // Lose 5.2 points per year

  const recentReviewThreshold = 4;
  const recentReviewBonus = 15;

  if (numberOfWeeksAgo < recentReviewThreshold) {
    score += recentReviewBonus;
  }

  /* Slightly prioritize positive reviews */
  score += (review.rating / 5)


  /* Penalize reviews with no tags */
  if (review?.tags?.length === 0) {
    score -= 5;
  }

  /* Penalize old reviews with few votes */
  const reviewIsOld = numberOfWeeksAgo > 52;
  if (reviewIsOld && votes < 5) {
    score -= 10;
  }

  score += weekAgePenalty * numberOfWeeksAgo;


  return score;
}