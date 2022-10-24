import { getSession } from "next-auth/react";
import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { updateUserPermissions } from "../../../../lib/backend/database/users";
import { CustomSession } from "../../../../lib/common/types";


const handler = nc<NextApiRequest, NextApiResponse>()
    .get(async (req, res) => { //should be a post
        const session = (await getSession({ req })) as CustomSession;
        const userID = req.query.userId as string;

        console.log(`Request to update permissions for user ${userID}`);

        // check if user is user or admin
        if (!session?.user?.id) {
            res.status(401).end("You are not logged in");
            return;
        }


        if (session.user.id !== userID && !session.user.admin) {
            res.status(403).end("You are not authorized to view this page");
            return;
        }

        //update user permissions
        try {
            await updateUserPermissions(userID);
            res.status(200).json({ message: "Permissions updated" });

        }
        catch (err) {
            res.status(500).json({ message: "Error updating permissions" });
        }

    }
    );


export default handler;


