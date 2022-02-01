import type { NextApiRequest, NextApiResponse } from 'next';
import data from "../../data/test-data.json";



type Data = {
  reviews: number
}

const handler = (req: NextApiRequest, res: NextApiResponse<Data>) => {
  res.status(200).json({ reviews: data.course.department.csci.num150.reviews})
}

export default handler;