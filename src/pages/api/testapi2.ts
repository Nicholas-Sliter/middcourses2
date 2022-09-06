import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import data from "../../data/test-data.json";
import { checkIfUserExists, generateUser, getAllUsers, getUserByEmail } from "../../lib/backend/database-utils";
import { canWriteReviews } from "../../lib/backend/utils";
import { CustomSession } from '../../lib/common/types';


type Data = {
  reviews: number
}


const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  //const email = "rdatar@middlebury.edu"; //req.query.email as string
  try {
    const session = await getSession({ req }) as unknown as CustomSession;
    const id = session?.user?.id;

    if (!id) {
      return res.status(400).end("Invalid email");
    }

    if (!(await canWriteReviews(id))) {
      res.status(403).end("You do not have permission to create reviews");
    }

    res.status(200).end("You can create reviews");

  } catch (e) {
    console.log(e);
    res.status(500).end("Something went wrong");

  }

  return;

}

export default handler;