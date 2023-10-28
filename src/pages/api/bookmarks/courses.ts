import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from "next-auth/react";
import { CustomSession } from "../../../lib/common/types";
import { getAllBookmarkedCatalogCoursesInSemester, getAllBookmarksInSemester } from "../../../lib/backend/database/bookmark";


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

    const session = (await getSession({ req })) as CustomSession;
    if (!session) {
        res.status(401).end("Unauthorized");
        return;
    }

    if (!session.user.authorized) {
        res.status(403).end("Forbidden");
        return;
    }

    if (!(session.user.role == "student")) {
        res.status(403).end("Forbidden");
        return;
    }


    const semester = req.query.semester as string;
    if (!semester || typeof semester != "string") {
        res.status(400).end("Bad Request");
        return;
    }


    const bookmarkedCourses = await getAllBookmarkedCatalogCoursesInSemester(session, semester);

    res.status(200).json({
        bookmarks: bookmarkedCourses
    });



});



export default handler;
