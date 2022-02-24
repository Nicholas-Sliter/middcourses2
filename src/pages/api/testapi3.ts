import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import data from "../../data/test-data.json";
import { checkIfUserExists, generateUser, getAllUsers, getUserByEmail, searchCourses } from "../../lib/backend/database-utils";
import { canWriteReviews } from "../../lib/backend/utils";
import { Session } from '../../lib/common/types';



interface Course {
  courseID: string,
  courseName: string,
}

type Data = {
  courses: Course[]
};


const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  //const email = "rdatar@middlebury.edu"; //req.query.email as string
  const query = req.query.query as string;
  
  //searchCourses
  const courses = await searchCourses(query) as Course[];
  console.log(courses);
  res.status(200).json({courses:courses});
  
}

export default handler;