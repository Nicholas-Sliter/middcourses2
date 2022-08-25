/**
 * Get recent reviews for an instructor (by slug)
 */

import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import { getRecentReviewsByInstructor } from "../../../../lib/backend/database-utils";
import { getSession } from "next-auth/react";

const handler = nc({
  onError: (err, req: NextApiRequest, res: NextApiResponse) => {
    console.log(err.stack);
    res.status(500).end("Something went wrong");
  },
  onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
    res.status(404).end("Not Found");
  },
}).get(async (req: NextApiRequest, res: NextApiResponse) => {
  const slug = req.query.slug as string;
  const session = (await getSession({ req })) as any;

  const limit = session.user.authorized ? null : 3;
  //null limit = no limit

  if (!slug) {
    res.status(404).end("Not Found");
    return;
  }

  //get recent reviews by department
  const reviews = await getRecentReviewsByInstructor(slug, limit);

  res.status(200).json(reviews);
});

export default handler;
