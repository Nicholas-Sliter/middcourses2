import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { getInstructorsByCourseID } from "../../../../lib/backend/database-utils";

const handler = nc({
  onError: (err, req: NextApiRequest, res: NextApiResponse) => {
    console.log(err.stack);
    res.status(500).end("Something went wrong");
  },
  onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
    res.status(404).end("Not Found");
  },
}).get(async (req: NextApiRequest, res: NextApiResponse) => {
  const courseID = req.query.id as string;
  //validate the course id is 4 uppercase letters followed by 4 digits
  //use regex pattern

  if (!courseID || !/^[A-Z]{4}[0-9]{4}$/.test(courseID)) {
    res.status(400).end("Invalid course id");
    return;
  }

  //get the course from the database
  const instructors = await getInstructorsByCourseID(courseID);

  //if the course doesn't exist, return 404
  if (!instructors) {
    res.status(404).end("Instructors not found");
    return;
  }

  res.status(200).json({instructors});
});

export default handler;
