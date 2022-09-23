import { getSession } from "next-auth/react";
import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { voteReviewByID } from "../../../../lib/backend/database/review";
import { CustomSession } from "../../../../lib/common/types";
import { isUUIDv4, toTitleCase } from "../../../../lib/common/utils";


const handler = nc({
    onError: (err, req: NextApiRequest, res: NextApiResponse) => {
        console.log(err.stack);
        res.status(500).json("Something went wrong");
        return;
    }
}).post(async (req: NextApiRequest, res: NextApiResponse) => {
    const reviewId = req.query.reviewId as string;
    const voteType = req.body.voteType as string;

    const session = (await getSession({ req })) as CustomSession;

    //validate reviewId is a uuid v4 using regex
    if (!isUUIDv4(reviewId)) {
        res.status(400).json({ message: `Invalid review id: ${reviewId}` });
        return;
    }

    //validate voteType is either "up" or "down"
    if (voteType !== "up" && voteType !== "down") {
        res.status(400).json({ message: `Invalid vote type: ${voteType}` });
        return;
    }

    //verify user is logged in, not banned
    if (!session || session.user.banned) {
        res.status(401).json({ message: "You must be logged in to vote" });
        return;
    }

    //instructors should not be able to vote on reviews
    if (session.user.role !== "student") {
        res.status(403).json({ message: "Instructors cannot vote on reviews" });
        return;
    }


    const { success, removed, value } = await voteReviewByID(reviewId, session.user.id, voteType);

    if (success) {
        let text = "";
        const voteText = toTitleCase(voteType);
        if (removed) {
            text = `${voteText}vote removed`;
        } else {
            text = `${voteText}vote added`;
        }
        res.status(200).json({ message: text, value: value });
        return;
    }

    res.status(500).json({ message: "Something went wrong" });
    return;


});

export default handler;
