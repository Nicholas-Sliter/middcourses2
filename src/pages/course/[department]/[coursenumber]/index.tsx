import { NextRouter, useRouter } from "next/router";

export default function CoursePage() {
  const router: NextRouter = useRouter();
  //const {dept,number}: any = router.query;
  const { department, coursenumber }: any = router.query;
  console.log(coursenumber);

  //do page api logic here, and check if course exists, else display 404


  return (
    <div>
      <h1>{department + " " + coursenumber}</h1>
    </div>
  );
}
