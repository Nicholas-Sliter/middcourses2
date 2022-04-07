import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { getInstructorsByDepartment, getInstructorsByDepartmentCourses } from "../../../../lib/backend/database-utils";

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
  const instructors = await getInstructorsByDepartment(deptCode);

  if (instructors && instructors.length > 0) {
    res.status(200).json({ instructors });
    return;
  }

  //try finding all instructors who teach for the department
  //if none found, return 404

  const instructors2 = await getInstructorsByDepartmentCourses(deptCode);

  if (instructors2 && instructors2.length > 0) {
    res.status(200).json({ instructors: instructors2 });
    return;
  }
  

  res.status(404).end("Not Found");
});

export default handler;
