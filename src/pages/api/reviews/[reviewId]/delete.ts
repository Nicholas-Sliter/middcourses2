import { getSession } from "next-auth/react";
import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { deleteReviewByID, getReviewByID, voteReviewByID, __getFullReviewByID } from "../../../../lib/backend/database/review";
import { updateUserPermissions } from "../../../../lib/backend/database/users";
import { CustomSession } from "../../../../lib/common/types";
import { isUUIDv4, toTitleCase } from "../../../../lib/common/utils";


const handler = nc({
    onError: (err, req: NextApiRequest, res: NextApiResponse) => {
        console.log(err.stack);
        res.status(500).json("Something went wrong");
        return;
    }
})

    .get(async (req: NextApiRequest, res: NextApiResponse) => {
        res.status(405).json("Method not allowed");
        return;
    })



    .post(async (req: NextApiRequest, res: NextApiResponse) => {
        const reviewId = req.query.reviewId as string;
        const permanent = req.query.permanent as string ?? "false";
        const permanentBool = permanent === "true" ? true : false;

        console.log(req.query);

        const session = (await getSession({ req })) as CustomSession;

        //validate reviewId is a uuid v4 using regex
        if (!isUUIDv4(reviewId)) {
            res.status(400).json({ message: `Invalid review id: ${reviewId}` });
            return;
        }

        const review = await __getFullReviewByID(reviewId);

        //verify user is logged in, not banned
        if (!session || session.user.banned) {
            res.status(401).json({ message: "You must be logged in to delete a review" });
            return;
        }

        //instructors should not be able to vote on reviews
        if (session.user.role !== "student") {
            res.status(403).json({ message: "Instructors cannot delete reviews" });
            return;
        }


        // check user is the author of the review or is an admin
        if (session.user.admin || session.user.id === review.reviewerID) {
            //delete review
            await deleteReviewByID(reviewId, permanentBool);
            //refresh profile
            await updateUserPermissions(review.reviewerID);
            res.status(200).json({ message: "Review deleted successfully" });
            return;
        } else {
            res.status(403).json({ message: "You do not have permission to delete this review" });
            return;
        }
    });

export default handler;
