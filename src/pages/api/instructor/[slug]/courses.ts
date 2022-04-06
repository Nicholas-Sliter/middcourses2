import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { getCoursesByInstructorSlug } from "../../../../lib/backend/database-utils";

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

  if (!slug) {
    res.status(400).end("Invalid instructor slug");
    return;
  }

  //get the instructor from the database
  const courses = await getCoursesByInstructorSlug(slug);

  res.status(200).json({
    courses,
  });
});

export default handler;
