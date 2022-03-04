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
import { getBaseData, getCourses, getDepartmentsData, processDepartmentsData } from "../../lib/backend/scripts";

interface Course {
  courseID: string;
  courseName: string;
}

type Data = {
  courses: Course[];
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  //const email = "rdatar@middlebury.edu"; //req.query.email as string
  //const id = req.query.id as string;

  //searchCourses
  //const c = (await getCourseAndInstructorsByID(id));
  //console.log(c);

  //const d = await processDepartmentsData("F21");
  //console.log(d);
  //console.log(d.length);
  //const json = JSON.stringify(d);


  //const c = await getCourses("W22");
  const c  = await getBaseData();
  const json = JSON.stringify(c);

  res.status(200).end(json);
};

export default handler;
