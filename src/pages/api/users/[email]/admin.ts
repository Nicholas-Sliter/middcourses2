import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from "next-auth/react";
import { CustomSession } from "../../../../lib/common/types";
import { changeUserAdminStatus } from "../../../../lib/backend/database/users";
import { cookieStorageManager } from "@chakra-ui/react";


const handler = nc({
    onError: (err, req: NextApiRequest, res: NextApiResponse) => {
        console.log(err.stack);
        res.status(500).end("Something went wrong");
    },
    onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
        res.status(404).end("Not Found");
    },
})


    .get(async (req: NextApiRequest, res: NextApiResponse) => {
        /* Allow an internal request or a request from an admin to trigger this endpoint */
        const session = (await getSession({ req })) as CustomSession;

        const isAdmin = session?.user?.admin ? true : false;
        const hasInternalAuth = req.headers.authorization === process.env.INTERNAL_AUTH;
        const authenticated = isAdmin || hasInternalAuth;

        if (!authenticated) {
            res.status(401).end("Unauthorized");
            return;
        }

        const { email } = req.query;
        let admin = false;

        if (req.body.admin) {
            if (typeof req.body.admin === "string") {
                admin = req.body.admin === "true" ? true : false;
            } else {
                admin = req.body.admin;
            }
        }


        if (!email) {
            res.status(400).end("Bad Request");
            return;
        }

        console.log(`Changing admin status of ${email} to ${admin}`);

        const result = await changeUserAdminStatus(email as string, admin as boolean);



        if (result) {
            return res.status(200).end("Success");
        }

        return res.status(500).end("Something went wrong");

    });

export default handler;