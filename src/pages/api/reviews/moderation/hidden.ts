//add a post to hidden using put and remove to unhide with the review id in the body
//use get to get a list of hidden reviews

import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";

const handler = nc({
  onError: (err, req: NextApiRequest, res: NextApiResponse) => {
    console.log(err.stack);
    res.status(500).end("Something went wrong");
  },
  onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
    res.status(404).end("Not Found");
  },
}).get((req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    message: "Hello World",
  });
});

export default handler;