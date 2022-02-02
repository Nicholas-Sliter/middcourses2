/**
 * Get the current graduation year of first semester freshmen based on the current date.
 */
export function getFirstSemesterGraduationYear(): string {
   const date = new Date();
   let year = date.getFullYear() + 4;

   //febs
   year = (date.getMonth() < 7) ? year + 0.5 : year;

   return year.toString();

}


export function isUUIDv4(id: string){
   if (id.length !== 36) {
      return false;
   }
   const re = /^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}$/i;
   return re.test(id);
}


export function checkIfFirstSemester(graduationYear: string) {
   if (graduationYear === getFirstSemesterGraduationYear()) {
      return true;
   }

   return false;

}


export function getCurrentSemester(){
   const date = new Date();
   const month = date.getMonth();
   let semester = "";
   if (month < 2){
      semester = "Winter";
   }
   else if (month < 6) {
      semester = "Spring";
   }
   else if (month < 9) {
      semester = "Summer";
   }
   else {
      semester = "Fall";
   }


   return semester;

}