import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getRecentReviewsByDepartment } from "../../lib/backend/database-utils";
import { getRecommendationsForUser } from "../../lib/backend/recommendations";
import getBaseData from "../../lib/backend/scripts/getBaseData";
import { CustomSession } from "../../lib/common/types";

interface Course {
  courseID: string;
  courseName: string;
}

type Data = {
  courses: Course[];
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

  // res.status(200).end(json);

  // getBaseData();
  //get session

  const session = await getSession({ req }) as unknown as CustomSession;

  const startTime = new Date().getTime();

  const recs = await getRecommendationsForUser(session);

  const endTime = new Date().getTime();

  console.log("Time to get recommendations: " + (endTime - startTime) + "ms");

  res.status(404).end(JSON.stringify(recs));

};

export default handler;
