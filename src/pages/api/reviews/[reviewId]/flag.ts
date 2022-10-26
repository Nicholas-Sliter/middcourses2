import { getSession } from "next-auth/react";
import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { flagReviewByID, voteReviewByID } from "../../../../lib/backend/database/review";
import { CustomSession } from "../../../../lib/common/types";
import { isUUIDv4, toTitleCase } from "../../../../lib/common/utils";


/**
 * Handler for review flagging
 * Reviews can be flagged by ANY (students and instructors) non-banned user
 * If a review has 3+ flags with no manual verification, temporarily remove it
 * If a review is manually approved by an admin, ignore this request
 * If an admin flags a review, remove it
 */

const handler = nc({
    onError: (err, req: NextApiRequest, res: NextApiResponse) => {
        console.log(err.stack);
        res.status(500).json("Something went wrong");
        return;
    }
}).post(async (req: NextApiRequest, res: NextApiResponse) => {
    const reviewId = req.query.reviewId as string;

    const reason = req.body.reason as string;

    const session = (await getSession({ req })) as CustomSession;

    //validate reviewId is a uuid v4 using regex
    if (!isUUIDv4(reviewId)) {
        res.status(400).json({ message: `Invalid review id: ${reviewId}` });
        return;
    }

    //verify user is logged in, not banned
    if (!session || session.user.banned) {
        res.status(401).json({ message: "You must be logged in to flag" });
        return;
    }


    //verify flag text is not empty
    if (!reason || reason.trim().length === 0) {
        res.status(400).json({ message: "Flag text cannot be empty" });
        return;
    }

    //verify flag text is less than 1000 characters
    if (reason.length > 254) {
        res.status(400).json({ message: "Flag text cannot be longer than 254 characters" });
        return;
    }

    //check if user is admin
    if (session.user.admin) {
        //delete review
        //unimplemented
        console.log(`Admin ${session.user.email} flagged review ${reviewId}`);
    }

    //flag review
    const { success, error } = await flagReviewByID(reviewId, reason, session);

    if (success) {
        res.status(200).json({ message: "Review flagged" });
        return;
    }

    res.status(500).json({ message: error });

});



export default handler;