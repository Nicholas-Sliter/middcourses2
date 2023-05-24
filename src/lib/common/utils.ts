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
    return (month >= 4) || (month === 3 && date.getDate() >= 4); // Early April since Fall Registration is in late April
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

/** Parse a time object from a course time string
 * Example: 11:15am-12:30pm on Tuesday, Thursday (Sep 11, 2023 to Dec 11, 2023) -> { "tuesday": {"start": "690", "end": "750"}, ... }
 * Example 2: 10:00am-11:30am on Monday, Tuesday, Wednesday, Thursday, Friday at 75SHS 224 (Jan 5, 2023 to Feb 2, 2023) 1:00pm-4:15pm on Monday, Tuesday, Wednesday, Thursday, Friday at 75SHS 224 (Jan 5, 2023 to Feb 2, 2023)
 * Example 3: '{"text":"1:30pm-4:15pm on Tuesday at AXN 105 (Sep 11, 2023 to Dec 11, 2023)"}'
 * Example 4: '{"text":"1:10pm-2:00pm on Friday (Sep 11, 2023 to Dec 11, 2023)"}'
 */
export function parseCourseTimeString(timeString: string): { day: string, start: number, end: number }[] {

  if (!timeString || timeString === "{\"text\":\"TBD\"}") {
    return [];
  }

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const timeRegex = /(\d{1,2}):(\d{2})(am|pm)-(\d{1,2}):(\d{2})(am|pm)/;
  const multipleTimesSeparator = ") ";

  const timeObject: { day: string, start: number, end: number }[] = [];

  const distinctTimes = timeString.split(multipleTimesSeparator);

  for (const time of distinctTimes) {
    let subTimeString = time;
    if (subTimeString.includes("(")) {
      subTimeString = subTimeString.split("(")[0];
    }

    if (subTimeString.includes(" at ")) {
      subTimeString = subTimeString.split(" at ")[0];
    }

    if (!subTimeString.includes(" on ")) {
      continue;
    }

    const timeStringSplit = subTimeString.split(" on ");
    const timeStringDays = timeStringSplit[1].split(", ");

    const timeStringTime = timeStringSplit[0];
    const timeStringTimeMatch = timeStringTime.match(timeRegex);

    if (!timeStringTimeMatch) {
      continue;
    }

    const timeStringTimeStart = timeStringTimeMatch[1];
    const timeStringTimeStartMinutes = timeStringTimeMatch[2];

    const timeStringTimeEnd = timeStringTimeMatch[4];
    const timeStringTimeEndMinutes = timeStringTimeMatch[5];

    const timeStringTimeStartAMPM = timeStringTimeMatch[3];
    const timeStringTimeEndAMPM = timeStringTimeMatch[6];

    /* Handle time around 12am or 12pm */
    const TimeStringTimeStartOffset = parseInt(timeStringTimeStart) == 12 ? 12 : 0;
    const TimeStringTimeEndOffset = parseInt(timeStringTimeEnd) == 12 ? 12 : 0;

    /* Convert to 24 hour time */
    const timeStringTimeStartHours = timeStringTimeStartAMPM === "pm" ? parseInt(timeStringTimeStart) + 12 - TimeStringTimeStartOffset : parseInt(timeStringTimeStart) - TimeStringTimeStartOffset;
    const timeStringTimeEndHours = timeStringTimeEndAMPM === "pm" ? parseInt(timeStringTimeEnd) + 12 - TimeStringTimeEndOffset : parseInt(timeStringTimeEnd) - TimeStringTimeEndOffset;

    const timeStringTimeStartMinutesTotal = timeStringTimeStartHours * 60 + parseInt(timeStringTimeStartMinutes);
    const timeStringTimeEndMinutesTotal = timeStringTimeEndHours * 60 + parseInt(timeStringTimeEndMinutes);

    for (const day of timeStringDays) {
      if (days.includes(day.toLowerCase().trim())) {
        timeObject.push({
          day: day.toLowerCase(),
          start: timeStringTimeStartMinutesTotal,
          end: timeStringTimeEndMinutesTotal
        });
      }
    }
  }

  return timeObject;

}


export function checkForTimeConflicts(times: { day: string, start: number, end: number }[]): boolean {

  // Push each time onto a master time object, if there is an overlap, then there is a conflict

  const masterTimeObject: Record<string, { start: number, end: number }[]> = {};

  for (const time of times) {
    const { day, start, end } = time;

    if (!masterTimeObject[day]) {
      masterTimeObject[day] = [];
    }

    /* Check for conflicts */
    if (masterTimeObject[day].length > 0) {
      for (const time of masterTimeObject[day]) {
        const { start: masterStart, end: masterEnd } = time;

        if (start < masterEnd && end > masterStart) {
          return true;
        }
      }
    }

    masterTimeObject[day].push({ start, end });
  }

  return false;
}

/** Parse a course ID from a raw catalog course ID
 * Example: CSCI1005A-W23 -> {code: CSCI1005, section: A, term: W23}
 * 
 */
export function parseRawCourseID(rawCourseID: string) {
  if (!rawCourseID) {
    return null;
  }

  try {
    const termSplitToken = "-";
    const termSplit = rawCourseID.split(termSplitToken);

    const courseCodeAndSection = termSplit[0];
    const term = termSplit[1];

    const courseSection = courseCodeAndSection.match(/[A-Z]$/g)[0];
    const courseCode = courseCodeAndSection.match(/\d+/g)[0];

    return {
      code: courseCode,
      section: courseSection,
      term
    };
  } catch (e) {
    return null;
  }


}



export function parseMaybeInt(input: string | number): number {
  if (typeof input === "number") {
    return input;
  }

  return parseInt(input);

}