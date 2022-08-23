import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { getAllDepartments, getDepartmentByID } from "../../../lib/backend/database-utils";
import { getTopReviewedDepartments, getTopRatedDepartments } from "../../../lib/backend/database/departments";

const handler = nc({
    onError: (err, req: NextApiRequest, res: NextApiResponse) => {
        console.log(err.stack);
        res.status(500).end("Something went wrong");
    },
    onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
        res.status(404).end("Not Found");
    }
})


    .get(async (req: NextApiRequest, res: NextApiResponse) => {

        //const departments = await getTopRatedDepartments(10);
        const departments = await getTopReviewedDepartments(10);

        if (!departments) {
            res.status(404).end("Not Found");
            return;
        }

        res.status(200).json({ departments });

    });


export default handler;