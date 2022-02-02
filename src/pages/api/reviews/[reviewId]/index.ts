import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { isUUIDv4 } from "../../../../lib/common/utils";

const handler = nc({
  onError: (err, req: NextApiRequest, res: NextApiResponse) => {
    console.log(err.stack);
    res.status(500).end("Something went wrong");
  },
  onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
    res.status(404).end("Not Found");
  },
}).get((req: NextApiRequest, res: NextApiResponse) => {
  const reviewId = req.query.reviewId as string;

  //validate reviewId is a uuid v4 using regex
  if (!isUUIDv4(reviewId)) {
    res.status(400).end(`Invalid review id: ${reviewId}`);
    return;
  }

  //get the review from the database
  //we don't need to authenticate the user because we use a UUID which is hard to guess
  //and this allows individual reviews to be shared without having to be logged in

  const review = null;

  //if the review doesn't exist, return 404
  if (!review) {
    res.status(404).end(`Review with id: ${reviewId} not found`);
    return;
  }

  res.status(200).json({
    message: JSON.stringify(review),
  });
});

export default handler;
