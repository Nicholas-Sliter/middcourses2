import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getRecentReviewsByDepartment } from "../../lib/backend/database-utils";
import updateSemester from "../../lib/backend/pipeline";
import { getRecommendationsForUser } from "../../lib/backend/recommendations";
import getBaseData from "../../lib/backend/scripts/getBaseData";
import { CustomSession } from "../../lib/common/types";

interface Course {
    courseID: string;
    courseName: string;
}

type Data = {
    courses: Course[];
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {


    const session = await getSession({ req }) as CustomSession;

    const semester = req.query.semester as string;

    if (!session || !session.user || !session.user.admin) {
        res.status(401).end("Unauthorized");
        return;
    }

    if (!semester) {
        res.status(400).end("Bad Request");
        return;
    }

    const result = await updateSemester(semester);




    res.status(200).end(JSON.stringify(result));

};

export default handler;
