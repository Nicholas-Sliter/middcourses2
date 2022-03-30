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
  getCourses,
  getDepartmentsData,
  getInstructors,
  getRawCoursesData,
  processDepartmentsData,
} from "../../lib/backend/scripts";
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
