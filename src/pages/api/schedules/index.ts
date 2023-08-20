import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from "next-auth/react";
import { CustomSession } from "../../../lib/common/types";
import { createPlan, deletePlan, getSchedulePlansForSemester } from "../../../lib/backend/database/schedule";


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

    if (!req.query.semester) {
        return res.status(400).end("Bad Request - Missing semester");
    }

    if (typeof req.query.semester !== "string") {
        return res.status(400).end("Bad Request - Invalid semester");
    }

    const schedules = getSchedulePlansForSemester(session, req.query.semester as string);

    if (!schedules) {
        return res.status(500).end("Internal Server Error");
    }

    return res.status(200).json(schedules);




});


handler.post(async (req: NextApiRequest, res: NextApiResponse) => {

    const session = await getSession({ req }) as CustomSession;

    if (!session) {
        return res.status(401).end("Unauthorized");
    }

    const { schedule } = req.body;

    if (!schedule) {
        return res.status(400).end("Bad Request");
    }

    schedule.userID = session.user.id; /* Prevent user injection */

    if (!schedule?.semester) {
        return res.status(400).end("Bad Request - Missing semester");
    }

    if (!schedule?.name) {
        return res.status(400).end("Bad Request - Missing name");
    }

    const plan = await createPlan(session, schedule);

    console.log(plan);

    if (!plan?.userID) {
        return res.status(500).end("Internal Server Error");
    }

    return res.status(200).end(JSON.stringify(plan));

});


handler.delete(async (req: NextApiRequest, res: NextApiResponse) => {
    console.log("DELETE");

    const session = await getSession({ req }) as CustomSession;

    console.log(session);

    if (!session) {
        return res.status(401).end("Unauthorized");
    }

    const { schedule } = req.body;

    console.log(schedule);

    if (!schedule) {
        return res.status(400).end("Bad Request");
    }

    schedule.userID = session.user.id; /* Prevent user injection */

    if (!schedule?.id) {
        return res.status(400).end("Bad Request - Missing ID");
    }

    // return deletePlan(session, schedule.id);

    const deleted = await deletePlan(session, schedule.id);

    if (!deleted) {
        return res.status(404).end("Internal Server Error");
    }

    return res.status(200).end("OK");

});

export default handler;
