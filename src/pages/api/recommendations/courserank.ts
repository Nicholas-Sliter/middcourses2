/* Endpoint for getting course recommendations based on the COURSERANK algorithm */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from "next-auth/react";
import { getCoursesInformation } from '../../../lib/backend/database/course';
import { getRecommendationsForUser } from '../../../lib/backend/recommendations';
import { CustomSession } from '../../../lib/common/types';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    const session = await getSession({ req }) as CustomSession;
    const userID = req.query.userid as string;
    const iters = req.query.iters as string;
    const num = req.query.num as string;

    if (userID) {
        if (session?.user?.id !== userID && !session?.user?.admin) {
            res.status(401).end("Not authorized");
            return;
        }

        session.user.id = userID;
    }

    const k = num ? Math.min(parseInt(num), 50) : 15;
    const maxIters = iters ? Math.min(parseInt(iters), 2000) : 200;

    const recs = await getRecommendationsForUser(session, k, 0, maxIters);

    const courses = await getCoursesInformation(recs);

    res.status(200).end(JSON.stringify(courses)); //tmp (just courseID)

}

export default handler;