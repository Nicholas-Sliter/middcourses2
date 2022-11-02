import crypto from "crypto";
import Filter from "bad-words";
import { getInstructorBySlug, __getFullUserByID } from "./database-utils";
import { User } from "../../lib/common/types";
import deJunk from "dejunk.js";
import metricEntropy, { getFrequencies } from "./entropy";
import stringSimilarity from "string-similarity";

/* Generate UUID */
export function uuidv4() {
  return crypto.randomUUID();
}


export const parseAvg = (avg: string | null | number) => {
  if (!avg) {
    return null;
  }

  if (typeof avg === "number") {
    return avg;
  }

  return parseFloat(avg);
}


export function parseStringToInt(str: string | undefined | null) {
  if (!str) {
    return 0;
  }

  const parsed = parseInt(str, 10);
  if (isNaN(parsed)) {
    return 0;
  }

  return parsed;

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


function composedOfSubstrings(str: string) {
  /** Theorem:  a String is made of the repeated substrings if and only
   *  if it's a nontrivial rotation of itself. */

  return (str + str).indexOf(str, 1) !== str.length;

}

function getWords(str: string) {
  return str.toLowerCase().split(" ");
}

function getWordDiversity(str: string) {
  const words = getWords(str);
  const uniqueWords = new Set(words);
  return uniqueWords.size / words.length;
}



function checkForRepeatedCharSubstrings(str: string) {
  const words = getWords(str);
  for (const word of words) {
    //check if there are strings of the same char in a sequence > 5
    const matches = word.match(/(.)\1{5,}/g);
    if (matches) {
      return true;
    }
  }
  return false;
}


export function isQualityReview(str: string, courseDescription: string = ""): boolean {

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

  // check avg word length is close on the English average
  const ENGLISH_AVG_WORD_LENGTH = 4.7;
  const wordLen = averageWordLength(str);
  const upperBound = ENGLISH_AVG_WORD_LENGTH * 2;
  const lowerBound = ENGLISH_AVG_WORD_LENGTH - 1.7;
  const sufficientWordLength: boolean = wordLen < upperBound && wordLen > lowerBound;

  // check that the letter (E, e) is in the top 5 most frequent letters
  const sortedFreqs = Object.entries(freqs).sort((a, b) => b[1] - a[1]);
  const top5 = sortedFreqs.slice(0, 5);
  const sufficientLetterFrequency: boolean = top5.some((entry) => entry[0] === "e" || entry[0] === "E");

  // check that the string is not composed of repeating substrings 
  // (e.g. copy pasted "Sample Sample Sample")
  const notComposedOfSubstrings: boolean = !composedOfSubstrings(str);

  // check that the string is not composed of the same few words
  const wordDiversity = getWordDiversity(str);
  const sufficientWordDiversity: boolean = wordDiversity > 0.4;

  // check that a review does not have repeated char substrings
  const noRepeatedCharSubstrings: boolean = !checkForRepeatedCharSubstrings(str);


  const containsRefToCharLimit: boolean = [
    "character limit",
    "200 characters",
    "200 character",
    "200 char",
  ]
    .some((phrase) => str.toLowerCase().includes(phrase));



  const hasTooLongWords: boolean = str.split(" ").some((word) => word.length > 24);

  const containsHomerowMashing: boolean = [
    "fhdsk",
    "fjds",
    "fsfj",
    "sfj",
    "hfjdsf",
    "jhkj",
    "hdsk",
    "hjds",
    "fghs",
    "fghjk",
    "asdf",
    "dfjh",
    "jhsg",
    "fhjdgslk",
    "dfnd",
    "fjsk",
    "fvyt",
    "dhjn",
    "kjlal",
    "hfdjk",
    "fhsdk",
    "fkdk",
    "jfhj",
    "jkhj",
    "jkjk",
  ].some((phrase) => str.toLowerCase().includes(phrase));


  //check if the user copy-pasted the course descirption or large parts of it
  // check if str distance is within 100ish?

  let containsCourseDescription = false;
  if (courseDescription) {

    //first check if courseDescription is a substring of str
    containsCourseDescription = str.toLowerCase().includes(courseDescription.toLowerCase());

    // check if word intersection is large enough
    if (!containsCourseDescription) {
      const courseDescriptionWords = courseDescription.toLowerCase().split(" ");
      const strWords = str.toLowerCase().split(" ");
      const courseDescriptionWordsSet = new Set(courseDescriptionWords);
      const strWordsSet = new Set(strWords);
      const intersection = new Set([...courseDescriptionWordsSet].filter(x => strWordsSet.has(x)));
      const intersectionSize = intersection.size;
      const courseDescriptionWordsSize = courseDescriptionWords.length;
      const strWordsSize = strWords.length;
      const intersectionRatio = intersectionSize / Math.min(courseDescriptionWordsSize, strWordsSize);
      containsCourseDescription = intersectionRatio > 0.9;

    }

    // check string similarity
    if (!containsCourseDescription) {
      const similarity = stringSimilarity.compareTwoStrings(courseDescription.toLowerCase(), str.toLowerCase());
      containsCourseDescription = similarity > 0.85;
    }

  }


  const containsLoremIpsum = str.toLowerCase().includes("lorem ipsum dolor sit amet,");

  // if the str includes a copy of …Read more then is probably a copy paste
  const containsReadMore = str.toLowerCase().includes("…read more");

  // look for filler text in last sentence
  // eg. fhdskflsdhfjdsfhdskfhds
  // const lastSentence = str.split(".").pop();
  // let lastSentenceQuality = true;
  // if (lastSentence) {
  //   //run isQualityReview on last sentence
  //   lastSentenceQuality = isQualityReview(lastSentence, "");
  // }


  console.log({
    notHasJunk: !hasJunk,
    sufficientAlphabetSize,
    sufficientEntropy,
    sufficientWordLength,
    sufficientLetterFrequency,
    notComposedOfSubstrings,
    sufficientWordDiversity,
    noRepeatedCharSubstrings,
    noRefToCharLim: !containsRefToCharLimit,
    noButtonMash: !containsHomerowMashing,
    noTooLongWords: !hasTooLongWords,
    noLoremIpsum: !containsLoremIpsum,
    noReadMore: !containsReadMore,
    doesNotContainCD: !containsCourseDescription,
    // lastSentenceQuality,
  });

  return !hasJunk &&
    sufficientAlphabetSize &&
    sufficientEntropy &&
    sufficientWordLength &&
    // sufficientLetterFrequency && //too many false positives
    notComposedOfSubstrings &&
    sufficientWordDiversity &&
    noRepeatedCharSubstrings &&
    !containsRefToCharLimit &&
    !containsHomerowMashing &&
    !hasTooLongWords &&
    !containsLoremIpsum &&
    !containsReadMore &&
    !containsCourseDescription
  // lastSentenceQuality;

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
