import { public_instructor } from "../common/types";

//eslint-disable-next-line no-unused-vars
export const DEFAULT_VALIDATOR = (_t:string) => {
  return { type: "", message: "" };
};

export interface MESSAGE_TYPE {
   type: string;
   message: string;
};



// https://stackoverflow.com/a/24173473
export function lastNameStringSort(a:string,b:string):boolean {
    return a.split(" ").pop()[0] > b.split(" ").pop()[0]
};

export function lastNameInstructorSort(a:public_instructor,b:public_instructor): number {
  return +lastNameStringSort(a.name,b.name);
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