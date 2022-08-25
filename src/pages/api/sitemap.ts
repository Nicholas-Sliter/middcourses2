import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import fs from "fs";
import {
  getAllCourses,
  getAllDepartments,
  getAllInstructors,
} from "../../lib/backend/database-utils";

/**
 * Generate a sitemap.xml file for the site on get request
 *
 */

const handler = nc({
  onError: (err, req: NextApiRequest, res: NextApiResponse) => {
    console.log(err.stack);
    res.status(500).end("Something went wrong");
  },
  onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
    res.status(404).end("Not Found");
  },
}).get(async (req: NextApiRequest, res: NextApiResponse) => {
  const urls = [];
  await Promise.all([
    //main page
    urls.push("https://midd.courses/"),

    //pivacy policy
    urls.push("https://midd.courses/privacy-policy.html"),

    //courses page
    urls.push("https://midd.courses/browse/courses"),

    //departments page
    urls.push("https://midd.courses/browse/departments"),

    //instructors page
    urls.push("https://midd.courses/browse/instructors"),

    //get all courses
    getAllCourses().then((courses) => {
      courses.forEach((course) => {
        const dept = course?.courseID?.substring(0, 4)?.toLowerCase();
        const number = course?.courseID?.substring(4)?.toLowerCase();
        urls.push(`https://midd.courses/reviews/${dept}/${number}`);
      });
    }),
    //get all departments
    getAllDepartments().then((departments) => {
      departments.forEach((department) => {
        const id = department?.departmentID?.toLowerCase();
        urls.push(`https://midd.courses/reviews/${id}`);
      });
    }),
    //get all instructors
    getAllInstructors().then((instructors) => {
      instructors.forEach((instructor) => {
        const slug = instructor?.slug?.toLowerCase();
        urls.push(`https://midd.courses/instructor/${slug}`);
      });
    })
  ]);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map((url) => `<url><loc>${url}</loc></url>`).join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.status(200).end(sitemap);
});

export default handler;
