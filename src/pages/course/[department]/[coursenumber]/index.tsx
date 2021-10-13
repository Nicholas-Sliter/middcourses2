import { NextRouter, useRouter } from "next/router";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  // ...
  console.log();
  

    return {
      props: {}, // will be passed to the page component as props
    };
};



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
