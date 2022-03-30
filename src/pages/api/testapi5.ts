import type { NextApiRequest, NextApiResponse } from "next";
import getBaseData from "../../lib/backend/scripts/getBaseData";

interface Course {
  courseID: string;
  courseName: string;
}

type Data = {
  courses: Course[];
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

  // res.status(200).end(json);

  getBaseData();

};

export default handler;
