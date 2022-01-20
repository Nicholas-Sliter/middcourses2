import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";

const handler = nc({
   onError: (err, req: NextApiRequest, res: NextApiResponse) => {
      console.log(err.stack);
      res.status(500).end("Something went wrong");
   },
   onNoMatch: (req: NextApiRequest, res: NextApiResponse) => { 
      res.status(404).end("Not Found");
   }
})


.get((req: NextApiRequest, res: NextApiResponse) => {
   
   res.status(200).json({
      message: "Hello World"
   });


})

.post((req: NextApiRequest, res: NextApiResponse) => {

   


});


export default handler;