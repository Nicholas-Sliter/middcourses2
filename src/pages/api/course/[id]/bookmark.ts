import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { bookmarkCourse } from "../../../../lib/backend/database/bookmark";
import { CustomSession } from "../../../../lib/common/types";
import { getSession } from "next-auth/react";


const handler = nc({
    onError: (err, req: NextApiRequest, res: NextApiResponse) => {
        console.log(err.stack);
        res.status(500).end({ error: "Something went wrong" });
    },
    onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
        res.status(404).end({ error: "Not Found" });
    },
})
    .put(async (req: NextApiRequest, res: NextApiResponse) => {

        const session = (await getSession({ req })) as CustomSession;
        const remove = req.body.remove;
        const courseID = (req.query.id as string).toUpperCase();

        if (Array.isArray(courseID)) {
            res.status(400).end({ error: "Invalid courseID" });
            return;
        }

        const { success, message } = await bookmarkCourse(session, courseID, remove);

        const wasAdded = !remove && success;
        const wasRemoved = remove && success;
        const error = !success;

        res.status(200).json({
            courseID,
            bookmarkAdded: wasAdded,
            bookmarkRemoved: wasRemoved,
            error,
            message

        });
    });


export default handler;