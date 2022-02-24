import crypto from "crypto";
import Filter from "bad-words";
import { __getFullUserByID } from "./database-utils";
import { User } from "../../lib/common/types";

/* Generate UUID */
export function uuidv4() {
  return crypto.randomUUID();
}

/* Determine if a string contains profanity */
export function containsProfanity(str: string) {
  const filter = new Filter();
  filter.removeWords("hell");

  return filter.isProfane(str);
}


export function isActive(user: User){

   if (user.banned){
      return false
   }

   if (user.archived){
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

   if (user.userType === "student" && isActive(user)){
      return true;
   }


  } catch (e) {
    //don't leak error
    console.log("Something went wrong");
  }
  return false; //fail safe
}
