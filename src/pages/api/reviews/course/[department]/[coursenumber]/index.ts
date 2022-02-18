import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { getReviewsByCourseID } from "../../../../../../lib/backend/database-utils";

/**
 * Get all course reviews for a specific course
 * GET: returns a list of all reviews for a specific course
 */
const handler = nc({
   onError: (err, req: NextApiRequest, res: NextApiResponse) => {
      console.log(err.stack);
      res.status(500).end("Something went wrong");
   },
   onNoMatch: (req: NextApiRequest, res: NextApiResponse) => { 
      res.status(404).end("Not Found");
   }
})


.get(async (req: NextApiRequest, res: NextApiResponse) => {

  
   const department = req.query.department as string;
   const courseNumber = req.query.coursenumber as string;
   //changed to lowercase
  
   const courseID = `${department.toUpperCase()}${courseNumber.trim()}`;

   if (!courseID || !department || !courseNumber) {
      res.status(400).end("Invalid course id");
   }

   //pattern to match course number is 4 digits
   if (!/^[0-9]{4}$/.test(courseNumber)) {
      res.status(400).end("Invalid course number");
   }

   //pattern to match department is 4 letters
   if (!/^[a-zA-Z]{4}$/.test(department)) {
      res.status(400).end("Invalid department");
   }

   const reviews = await getReviewsByCourseID(courseID);

   if (!reviews) {
      res.status(404).end("Reviews not found for this course");
   }

   res.status(200).json({
      courseID: courseID,
      reviews: reviews
   });


});


export default handler;