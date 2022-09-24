import crypto from "crypto";
import Filter from "bad-words";
import { getInstructorBySlug, __getFullUserByID } from "./database-utils";
import { User } from "../../lib/common/types";
import deJunk from "dejunk.js";
import metricEntropy, { getFrequencies } from "./entropy";

/* Generate UUID */
export function uuidv4() {
  return crypto.randomUUID();
}



export const DEPARTMENT_PADDING_PREFIX = "_";


/* Determine if a string contains profanity */
export function containsProfanity(str: string) {
  const filter = new Filter();
  filter.removeWords("hell");

  return filter.isProfane(str);
}

function averageWordLength(str: string) {
  const words = str.split(" ");
  const total = words.reduce((sum, word) => sum + word.length, 0);
  return total / words.length;
}


export function isQualityReview(str: string): boolean {

  // test for button mashing
  // ensure the string has less than 10% junk characters
  const hasJunk: boolean = deJunk.hasJunk(str, 0.1);

  // check that alphabet size is at least log2(len(str)) + 2 (to account for spaces and punctuation)
  const freqs = getFrequencies(str);
  const alphabetSize = Object.keys(freqs).length;
  const sufficientAlphabetSize = Math.log2(str.length) + 2 <= alphabetSize;

  // check that entropy is less than 0.1 and greater than 0.02
  const entropy: number = metricEntropy(str);
  const sufficientEntropy: boolean = entropy < 0.1 && entropy > 0.002;

  //check avg word length
  const ENGLISH_AVG_WORD_LENGTH = 4.7;
  const wordLen = averageWordLength(str);
  const upperBound = ENGLISH_AVG_WORD_LENGTH * 2;
  const lowerBound = ENGLISH_AVG_WORD_LENGTH - 1.7;
  const sufficientWordLength: boolean = wordLen < upperBound && wordLen > lowerBound;

  // check that the letter (E, e) is in the top 5 most frequent letters
  const sortedFreqs = Object.entries(freqs).sort((a, b) => b[1] - a[1]);
  const top5 = sortedFreqs.slice(0, 5);
  const sufficientLetterFrequency: boolean = top5.some((entry) => entry[0] === "e" || entry[0] === "E");

  console.log({ hasJunk, sufficientAlphabetSize, sufficientEntropy, sufficientWordLength, sufficientLetterFrequency });

  return !hasJunk && sufficientAlphabetSize && sufficientEntropy && sufficientWordLength && sufficientLetterFrequency;

}


export function isActive(user: User) {

  if (user.banned) {
    return false
  }

  if (user.archived) {
    return false
  }

  return true


}


/**
 * Full backend permission verification for review write access
 * @authentication {self, backend only}
 * @param id 
 * @returns boolean if the user can create/edit reviews
 */
export async function canWriteReviews(id: string) {
  //get user from database
  try {
    const user = await __getFullUserByID(id);

    if (!user) {
      return false;
    }

    if (user.userType === "student" && isActive(user)) {
      return true;
    }


  } catch (e) {
    //don't leak error
    console.log("Something went wrong");
  }
  return false; //fail safe
}


/**
 * Checks if an instructor slug already exists in the database
 * @param slug 
 */
export async function isSlugUnique(slug: string) {

  const instructor = await getInstructorBySlug(slug);

  if (instructor) {
    return false
  }

  return true

}


export async function incrementSlugUntilUnique(slug: string) {

  const MAX_ATTEMPTS = 10;

  let newSlug = slug;
  let i = 1
  while (!(await isSlugUnique(newSlug)) && i < MAX_ATTEMPTS) {
    newSlug = slug + "-" + i.toString();
    i++;
  }

  return newSlug;

}
