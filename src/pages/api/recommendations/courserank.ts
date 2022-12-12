/* Endpoint for getting course recommendations based on the COURSERANK algorithm */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from "next-auth/react";
import { getRecommendationsForUser } from '../../../lib/backend/recommendations';
import { CustomSession } from '../../../lib/common/types';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    const session = await getSession({ req }) as CustomSession;
    const userID = req.query.userid as string;

    if (userID) {
        if (session?.user?.id !== userID && !session?.user?.admin) {
            res.status(401).end("Not authorized");
            return;
        }

        session.user.id = userID;
    }

    const recs = await getRecommendationsForUser(session);

    res.status(200).end(JSON.stringify(recs)); //tmp (just courseID)

}

export default handler;