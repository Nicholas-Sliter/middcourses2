import type { NextApiRequest, NextApiResponse } from "next";
import { getBaseCourseAverages, getTopEasyAndValuableCourses } from "../../lib/backend/database/rankings";

interface Course {
  courseID: string;
  courseName: string;
}

type Data = {
  courses: Course[];
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

  const aggregateData = await getBaseCourseAverages();
  const courses: Course[] = getTopEasyAndValuableCourses(aggregateData, 10);

  res.status(200).json({ courses });

};

export default handler;
