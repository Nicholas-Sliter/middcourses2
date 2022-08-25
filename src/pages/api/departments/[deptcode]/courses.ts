import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { getCoursesByDepartment } from "../../../../lib/backend/database-utils";

const handler = nc({
  onError: (err, req: NextApiRequest, res: NextApiResponse) => {
    console.log(err.stack);
    res.status(500).end("Something went wrong");
  },
  onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
    res.status(404).end("Not Found");
  },
}).get(async (req: NextApiRequest, res: NextApiResponse) => {
  const deptCode = req.query.deptcode as string;
  const courses = await getCoursesByDepartment(deptCode);

  if (!courses || courses.length === 0) {
    res.status(404).end("Not Found");
    return;
  }

  res.status(200).json({ courses });
});

export default handler;
