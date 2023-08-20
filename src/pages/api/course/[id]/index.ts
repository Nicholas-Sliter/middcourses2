import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { getCourseByID } from "../../../../lib/backend/database-utils";
import { isValidCourseID } from "../../../../lib/common/utils";
import { getSession } from "next-auth/react";
import { CustomSession } from "../../../../lib/common/types";
import { optimizedSSRCoursePage } from "../../../../lib/backend/database/course";

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

      const session = await getSession({ req }) as CustomSession;

      const courseID = req.query.id as string;
      //validate the course id is 4 uppercase letters followed by 4 digits
      //or underscore followed by 3 letters and 4 digits, thanks ART.
      //use regex pattern

      if (!isValidCourseID(courseID)) {
         console.log("invalid course id");
         res.status(400).end("Invalid course id");
         return;
      }



      //get the course from the database
      // const course = await getCourseByID(courseID)
      const course = await optimizedSSRCoursePage(courseID, session, true);

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