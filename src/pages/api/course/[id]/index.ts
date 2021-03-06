import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { getCourseByID } from "../../../../lib/backend/database-utils";

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
   
   const courseID = req.query.id as string;
   //validate the course id is 4 uppercase letters followed by 4 digits
   //or underscore followed by 3 letters and 4 digits, thanks ART.
   //use regex pattern

   if (!courseID || !/^[_|A-Z]{1}[A-Z]{3}[0-9]{4}$/.test(courseID)) {
    console.log("invalid course id");
    res.status(400).end("Invalid course id");
    return;
   }



   //get the course from the database
   const course = await getCourseByID(courseID)
 
   //switching to getCourseAndInstructorsByID adds 200ms delay

   //if the course doesn't exist, return 404
   if (!course) {
       res.status(404).end("Course not found");
       return;
   }


   res.status(200).json({
      course: course,
   });


})

.post((req: NextApiRequest, res: NextApiResponse) => {
   


});


export default handler;