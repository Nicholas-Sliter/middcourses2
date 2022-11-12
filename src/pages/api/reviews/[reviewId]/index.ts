import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { isUUIDv4 } from "../../../../lib/common/utils";
import { getReviewByID } from "../../../../lib/backend/database-utils";
import { getSession } from "next-auth/react";
import { CustomSession, full_review } from "../../../../lib/common/types";
import { __insertReview } from "../../../../lib/backend/database/review";

const handler = nc({
  onError: (err, req: NextApiRequest, res: NextApiResponse) => {
    console.log(err.stack);
    res.status(500).end("Something went wrong");
  },
  onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
    res.status(404).end("Not Found");
  },
}).get(async (req: NextApiRequest, res: NextApiResponse) => {
  const reviewId = req.query.reviewId as string;

  //validate reviewId is a uuid v4 using regex
  if (!isUUIDv4(reviewId)) {
    res.status(400).end(`Invalid review id: ${reviewId}`);
    return;
  }

  //get the review from the database
  //we don't need to authenticate the user because we use a UUID which is hard to guess
  //and this allows individual reviews to be shared without having to be logged in

  const review = await getReviewByID(reviewId);

  //if the review doesn't exist, return 404
  if (!review) {
    res.status(404).end(`Review with id: ${reviewId} not found`);
    return;
  }

  //JSON.stringify(review)
  res.status(200).json({
    message: review,
  });
})

  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    //allow admin to submit a review for a user manually
    const reviewID = req.query.reviewId as string;
    //check session
    const session = (await getSession({ req })) as CustomSession;
    //check user is admin
    if (!session) {
      res.status(401).end("You must be logged in to use this endpoint");
      return;
    }

    if (!session?.user?.admin) {
      res.status(401).end("You must be an admin to use this endpoint");
      return;
    }


    //given a review in the post body, insert it into the database
    const review = req.body as full_review;
    await __insertReview(review);

    res.status(200).end("Review inserted");

  });

export default handler;
