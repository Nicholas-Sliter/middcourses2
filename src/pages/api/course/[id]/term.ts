import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { getInstructorsAndTermsByCourseID } from "../../../../lib/backend/database-utils";
import { isValidCourseID } from "../../../../lib/common/utils";

const handler = nc({
  onError: (err, req: NextApiRequest, res: NextApiResponse) => {
    console.log(err.stack);
    res.status(500).end("Something went wrong");
  },
  onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
    res.status(404).end("Not Found");
  },
})
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const courseID = req.query.id as string;
    //validate the course id is 4 uppercase letters followed by 4 digits
    //use regex pattern

    if (!isValidCourseID(courseID)) {
      res.status(400).end("Invalid course id");
      return;
    }

    //get the course from the database
    const data = await getInstructorsAndTermsByCourseID(courseID);

    //if the course doesn't exist, return 404
    if (!data) {
      res.status(404).end("Info not found");
      return;
    }

    res.status(200).json({
      data,
    });
  })

export default handler;
