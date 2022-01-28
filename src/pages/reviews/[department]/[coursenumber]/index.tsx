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
  const { department, coursenumber, semester, instructor }: any = router.query;
  console.log(coursenumber);
  console.log("semester: " + semester);
  console.log("instructor: " + instructor);
  //do page api logic here, and check if course exists, else display 404
  

  return (
    <div>
      <h1>{department.toUpperCase() + " " + coursenumber}</h1>
    </div>
  );
}
