import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from "next-auth/react";
import { CatalogCourseWithInstructors, CustomSession } from "../../../../../lib/common/types";
import { getCatalogCourses } from "../../../../../lib/backend/database/schedule";


const handler = nc({
    onError: (err, req: NextApiRequest, res: NextApiResponse) => {
        console.log(err.stack);
        res.status(500).end("Something went wrong");
    },
    onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
        res.status(404).end("Not Found");
    },
});


handler.get(async (req: NextApiRequest, res: NextApiResponse) => {

    const session = await getSession({ req }) as CustomSession;
    const courseID = (req.query.id as string).toUpperCase();

    if (!session) {
        return res.status(401).end("Unauthorized");
    }

    if (!session.user.id) {
        return res.status(400).end("Bad Request");
    }

    if (!req.query.semester) {
        return res.status(400).end("Bad Request - Missing semester");
    }

    if (typeof req.query.semester !== "string") {
        return res.status(400).end("Bad Request - Invalid semester");
    }

    const catalogCourseEntries: Array<CatalogCourseWithInstructors> = await getCatalogCourses(session, req.query.semester, courseID);

    return res.status(200).json(catalogCourseEntries);




});

export default handler;
