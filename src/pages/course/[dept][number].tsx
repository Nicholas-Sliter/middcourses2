import { NextRouter, useRouter } from "next/router";

export default function CoursePage() {
  const router: NextRouter = useRouter();
  const {dept,number}: any = router.query;

  return <div><p>{dept}</p></div>;
}
