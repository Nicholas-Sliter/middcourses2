import crypto from 'crypto';
import Filter from 'bad-words';

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

