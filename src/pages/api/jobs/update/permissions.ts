import { getSession } from "next-auth/react";
import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { updateAllUserPermissions } from "../../../../lib/backend/database/users";
import { CustomSession } from "../../../../lib/common/types";


const handler = nc<NextApiRequest, NextApiResponse>()
    .get(async (req, res) => {
        /* Allow an internal request or a request from an admin to trigger this endpoint */
        const session = (await getSession({ req })) as CustomSession;
        const isAdmin = session?.user?.admin ? true : false;
        const hasInternalAuth = req.headers.authorization === process.env.INTERNAL_AUTH;

        console.log(session);

        if ((!isAdmin) && (!hasInternalAuth)) {
            res.status(401).end("Unauthorized");
            return;
        }


        try {
            const updateRes = await updateAllUserPermissions();
            console.log(`Updated ${updateRes} users`);
            res.status(200).end("Success");
            return;

        } catch (err) {
            console.error(err);
            res.status(500).end("Internal Server Error");
            return;
        }

    }

    );


export default handler;