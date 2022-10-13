import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import data from "../../data/test-data.json";
import { checkIfUserExists, generateUser, getAllUsers } from "../../lib/backend/database-utils";
import { CustomSession } from '../../lib/common/types';



type Data = {
  reviews: number
}


const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const session = await getSession({ req }) as CustomSession;

  try {
    if (!session?.user?.admin) {
      res.status(401).end({ message: "Not authorized" });
      return;
    }
    const users = await getAllUsers();
    res.status(200).end(JSON.stringify(users));
  } catch (e) {
    console.log(e);
    res.status(500).end("Something went wrong");

  }

}

export default handler;