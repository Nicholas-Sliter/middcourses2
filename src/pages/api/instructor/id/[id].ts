import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { getInstructorByID } from "../../../../lib/backend/database-utils";

const handler = nc({
   onError: (err, req: NextApiRequest, res: NextApiResponse) => {
      console.log(err.stack);
      res.status(500).end("Something went wrong");
   },
   onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
      res.status(404).end("Not Found");
   }
}).get(async (req: NextApiRequest, res: NextApiResponse) => {
   const id = req.query.id as string;

   //validate instructor id is 32 characters long
   if (!id || id.length !== 32) {
      res.status(400).end("Invalid instructor id");
      return;
   }

   //get the instructor from the database
   const instructor = await getInstructorByID(id);

   //if the instructor doesn't exist, return 404
   if (!instructor) {
      res.status(404).end("Instructor not found");
      return;
   }

   res.status(200).json({
      instructor: instructor
   });

});

export default handler;