import type { NextApiRequest, NextApiResponse } from 'next';
import data from "../../data/test-data.json";
import { checkIfUserExists, generateUser, getAllUsers } from "../../lib/backend/database-utils";



type Data = {
  reviews: number
}


const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  //const email = "rdatar@middlebury.edu"; //req.query.email as string
try {
  const email = req.query.email as string;
  console.log(email);

  const r = await generateUser(email);
  const users = await getAllUsers();
  res.status(200).end(JSON.stringify(users));
} catch (e) {
  console.log(e);
  res.status(500).end("Something went wrong");

}
  
}

export default handler;