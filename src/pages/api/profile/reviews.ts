import { getSession } from "next-auth/react";
import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { getReviewsByUserID } from "../../../lib/backend/database/review";
import { CustomSession } from "../../../lib/common/types";


const handler = nc<NextApiRequest, NextApiResponse>()
    .get(async (req, res) => {
        const session = (await getSession({ req })) as CustomSession;
        const loggedIn = session?.user?.email ? true : false;
        const userID = session?.user?.id;

        if (!loggedIn) {
            res.status(401).end("You are not logged in");
            return;
        }

        //get the user's reviews
        try {
            const reviews = await getReviewsByUserID(userID);
            res.status(200).json({ reviews });
        }
        catch (err) {
            res.status(500).json({ message: "Error getting reviews" });
        }

    }
    );


export default handler;