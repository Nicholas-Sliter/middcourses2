import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import data from "../../data/test-data.json";
import {
  checkIfUserExists,
  generateUser,
  getAllUsers,
  getUserByEmail,
  searchCourses,
  getCourseAndInstructorsByID,
} from "../../lib/backend/database-utils";
import { canWriteReviews } from "../../lib/backend/utils";
import { Session } from "../../lib/common/types";
import {
  getBaseData,
  getCourses,
  getDepartmentsData,
  getInstructors,
  getRawCoursesData,
  processDepartmentsData,
} from "../../lib/backend/scripts";

interface Course {
  courseID: string;
  courseName: string;
}

type Data = {
  courses: Course[];
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

  // res.status(200).end(json);

  const rcourses = await getRawCoursesData('W22');



  const i = await getInstructors(rcourses.slice(0,10));

  res.status(200).end(JSON.stringify(i));


};

export default handler;
