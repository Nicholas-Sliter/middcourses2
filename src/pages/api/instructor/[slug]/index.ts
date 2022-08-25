import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { getInstructorBySlug } from "../../../../lib/backend/database-utils";

const handler = nc({
  onError: (err, req: NextApiRequest, res: NextApiResponse) => {
    console.log(err.stack);
    res.status(500).end("Something went wrong");
  },
  onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
    res.status(404).end("Not Found");
  },
}).get(async (req: NextApiRequest, res: NextApiResponse) => {
  const slug = req.query.slug as string;

  //validate instructor id is 32 characters long
  if (!slug) {
    res.status(400).end("Invalid instructor slug");
    return;
  }

  //get the instructor from the database
  const instructor = await getInstructorBySlug(slug);

  //if the instructor doesn't exist, return 404
  if (!instructor) {
    res.status(404).end("Instructor not found");
    return;
  }

  res.status(200).json({
    instructor: instructor,
  });
});

export default handler;
