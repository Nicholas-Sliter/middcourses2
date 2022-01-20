import { NextRouter, useRouter } from "next/router";

export default function ReviewPage() {
  const router: NextRouter = useRouter();
  //const {dept,number}: any = router.query;
   console.log(router.query.id);
   

  return (
    <>
      <p>{router.query.id}</p>
    </>
  );
}
