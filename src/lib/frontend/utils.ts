import { public_instructor } from "../common/types";
import Fuse from "fuse.js";

//eslint-disable-next-line no-unused-vars
export const DEFAULT_VALIDATOR = (_t: string) => {
  return { type: "", message: "" };
};

export interface MESSAGE_TYPE {
  type: string;
  message: string;
}

// https://stackoverflow.com/a/24173473
export function lastNameStringSort(a: string, b: string): boolean {
  return a.split(" ").pop()[0] > b.split(" ").pop()[0];
}

export function lastNameInstructorSort(
  a: public_instructor,
  b: public_instructor
): number {
  return +lastNameStringSort(a.name, b.name);
}

// https://stackoverflow.com/a/66390028
const units: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 31536000000 },
  { unit: "month", ms: 2628000000 },
  { unit: "day", ms: 86400000 },
  { unit: "hour", ms: 3600000 },
  { unit: "minute", ms: 60000 },
  { unit: "second", ms: 1000 },
];
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/**
 * Get language-sensitive relative time message from Dates.
 * @param relative  - the relative dateTime, generally is in the past or future
 * @param pivot     - the dateTime of reference, generally is the current time
 */
export function relativeTimeFromDates(
  relative: Date | null,
  pivot: Date = new Date()
): string {
  if (!relative) return "";
  const elapsed = relative.getTime() - pivot.getTime();
  return relativeTimeFromElapsed(elapsed);
}

/**
 * Get language-sensitive relative time message from elapsed time.
 * @param elapsed   - the elapsed time in milliseconds
 */
export function relativeTimeFromElapsed(elapsed: number): string {
  for (const { unit, ms } of units) {
    if (Math.abs(elapsed) >= ms || unit === "second") {
      return rtf.format(Math.round(elapsed / ms), unit);
    }
  }
  return "";
}

/**
 * A mapping of values (1-10) and corresponding human-understandable strings.
 */
export const valueMapping = {
  1: "Extremely low",
  2: "Very low",
  3: "Low",
  4: "Low",
  5: "Average",
  6: "Above average",
  7: "High",
  8: "Very high",
  9: "Extremely high",
  10: "Extremely high",
};

/**
 * A mapping of difficulties (1-10) and corresponding human-understandable strings.
 */
export const difficultyMapping = {
  1: "Extremely low",
  2: "Very low",
  3: "Low",
  4: "Low",
  5: "Average",
  6: "Some",
  7: "Very ",
  8: "Extremely",
  9: "Hardcore",
  10: "Impossible",
};



export const standardMapping = valueMapping;


export function relativeDifference(a: number, b: number) {
  return Math.round(100 * ((a - b) / ((a + b) / 2)));
}

export function getRelativeDifferenceText(a: number, b: number) {
  const diff = relativeDifference(a, b);
  const relativeLocation = diff > 0 ? "above" : "below";
  const absDiff = Math.abs(diff);
  if (!absDiff) {
    return "";
  }
  return `${absDiff}% ${relativeLocation} average`;
}

//map a value from 0-200 to a color from light green to dark green
export function getPositiveColor(value: number) {
  const val = Math.min(200, value);
  const color = Math.round(255 * (val / 200));
  return `rgb(${color}, 255, ${color})`;
}

//map a value from -200-0 to a color from light red to dark red
export function getNegativeColor(value: number) {
  const val = Math.min(200, -value);
  const color = Math.round(255 * (val / 200));
  return `rgb(255, ${color}, ${color})`;
}

export function getRelativeDifferenceColor(
  value: number,
  positiveGood: boolean
) {
  //TODO: this is buggy as we pass the negative value into getPositiveColor in both cases
  //consider removing this code and just hardcoding the colors and thresholds
  const sameSign = value > 0 === positiveGood;
  if (sameSign) {
    return getPositiveColor(value);
  }
  return getNegativeColor(value);
}

//based on current year return a list of valid grad years
export function getGradYears() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const validYears: string[] = [];

  const bound = currentMonth < 7 ? 4 : 5;

  for (let i = 0; i < bound; i++) {
    validYears.push(`${currentYear + i}`);
    validYears.push(`${currentYear + i}.5`);
  }

  return validYears;
}

export function orderSearchResults(
  results: any[],
  contentType: string,
  pattern: string
){
  const keys =
    contentType === "instructor"
      ? [{ name: "name", weight: 3 },"departmentID"]
      : [{ name: "courseID", weight: 3 }, {name: "courseName", weight: 2}, "courseDescription"];

  //use Fuse.js
  const fuse = new Fuse(results, {
    keys: keys,
    threshold: 0.6,
    includeScore: true,
    shouldSort: true,
    minMatchCharLength: 2,
  });


  const orderedResults = fuse.search(pattern);
  
  return orderedResults;
}



export function convertTermToFullString(term: string){
  let s = "";
  switch(term[0]){
    case "F":
      s = "Fall";
      break;
    case "W":
      s = "Winter";
      break;
    case "S":
      s = "Spring";
      break;
  };

  s += ` 20${term.slice(1)}`;
  return s; 
}