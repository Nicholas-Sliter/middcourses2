import { NextRouter, useRouter } from "next/router";

export default function ReviewPage() {
  const router: NextRouter = useRouter();
  //const {dept,number}: any = router.query;

  return (
    <div>
      <p>{router.query.id}</p>
    </div>
  );
}
