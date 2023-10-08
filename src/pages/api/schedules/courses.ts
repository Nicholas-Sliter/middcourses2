import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from "next-auth/react";
import { CustomSession } from "../../../lib/common/types";
import { addCoursesToSchedule, createPlan, deletePlan, getScheduleCourses, getSchedulePlan, getSchedulePlansForSemester, removeCoursesFromSchedule } from "../../../lib/backend/database/schedule";


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

    if (!session) {
        return res.status(401).end("Unauthorized");
    }

    if (!session.user.id) {
        return res.status(400).end("Bad Request");
    }

    if (!req.query.planID) {
        return res.status(400).end("Bad Request - Missing planID");
    }

    if (typeof req.query.planID !== "string") {
        return res.status(400).end("Bad Request - Invalid planID");
    }

    const schedules = await getScheduleCourses(session, req.query.planID);

    if (!schedules) {
        return res.status(500).end("Internal Server Error");
    }

    return res.status(200).json(schedules);




});

export default handler;