import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { searchCourses, searchInstructors } from "../../../lib/backend/database-utils";
import { cleanString } from "../../../lib/common/utils";


const handler = nc({
  onError: (err, req: NextApiRequest, res: NextApiResponse) => {
    console.log(err.stack);
    res.status(500).end("Something went wrong");
  },
  onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
    res.status(404).end();
  }
})



.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const q = req.query.q as string;

  if (!q) {
    res.status(400).end("No query provided");
    return;
  }

  //clean the query and take only the first 24 characters
  const query = cleanString(q).substring(0, 24);

  const courses = await searchCourses(query);
  const instructors = await searchInstructors(query);

  res.status(200).json({courses, instructors});


});



export default handler;
