import crypto from 'crypto';

/* Generate UUID */
export function uuidv4() {
   
   return crypto.randomUUID();

}

