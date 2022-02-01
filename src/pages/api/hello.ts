// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
//TypeScript example
import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from 'next'

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