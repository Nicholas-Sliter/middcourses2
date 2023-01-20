import { getSession } from "next-auth/react";
import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { backupReviews } from "../../../../lib/backend/database/review";
import { CustomSession } from "../../../../lib/common/types";

/* Update db with semester data */
const handler = nc<NextApiRequest, NextApiResponse>()
    .get(async (req, res) => {
        /* Allow an internal request or a request from an admin to trigger this endpoint */
        const session = (await getSession({ req })) as CustomSession;

        const isAdmin = session?.user?.admin ? true : false;
        const hasInternalAuth = req.headers.authorization === process.env.INTERNAL_AUTH;


        if ((!isAdmin) && (!hasInternalAuth)) {
            res.status(401).end("Unauthorized");
            return;
        }


        try {
            await backupReviews();
            return res.status(200).end("Success");

        } catch (err) {
            console.error(err);
            res.status(500).end("Internal Server Error");
            return;
        }

    }

    );


export default handler;