import PageTitle from "../components/common/PageTitle";

import styles from "../styles/pages/Home.module.scss";
import Feature from "../components/common/Feature";
import FlexGroup from "../components/common/FlexGroup";
// import { useSession } from "next-auth/react";
import { FaBook, FaBuilding, FaUserGraduate } from "react-icons/fa";
import SearchBar from "../components/common/SearchBox";
import { CustomSession } from "../lib/common/types";
import { useSession } from "next-auth/react";
import { useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import HowItWorks from "../components/HowItWorks";
import CourseCardRow from "../components/CourseCardRow";
import { getTopValueForDifficultyCourses } from "../lib/backend/database/rankings";
import Link from "next/link";
import { QuickLinkBar } from "../components/QuickLinks";


export default function Home() {
  const { data: session } = useSession() as { data: CustomSession };
  const toast = useToast();
  const reviewid = "review2toast";
  const bannedid = "bannedtoast";

  useEffect(() => {

    // need more reviews toast
    if (session?.user && !session?.user?.authorized && !toast.isActive(reviewid)) {
      toast({
        title: "To view course reviews you must submit at least 2 reviews.",
        status: "info",
        duration: 100000,
        isClosable: true,
        id: reviewid,
        position: "bottom"

      })
    }

    // is banned toast
    if (session?.user && session?.user?.banned && !toast.isActive(bannedid)) {
      toast({
        title: "You have been temporarily banned from submitting reviews.",
        description: "If you believe this is an error, please contact us.",
        status: "error",
        duration: 100000,
        isClosable: true,
        id: bannedid,
        position: "bottom"

      })
    }

  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps


  const canonicalURL = "https://midd.courses";

  return (
    <>
      <PageTitle pageTitle="Home" canonicalURL={canonicalURL} />
      <section className={styles.pageTop}>
        {/* <QuickLinkBar /> */}
        <SearchBar showResultDropdown />
        {/* <Link href={"/browse/courses"} passHref>
          <a style={{ fontWeight: "bold" }}>or browse course rankings</a>
        </Link> */}
        <QuickLinkBar />
        <div style={{ height: '10rem' }}></div>
        {/* <div style={{ maxWidth: "80%", margin: "0 auto" }}>
          <FlexGroup>
            <Feature>
              <FaBook />
              <h3>Browse Courses</h3>
              <p>
                MiddCourses is Middlebury&apos;s premier course discovery and review platform.  Browse from our complete catalogue to discover the perfect course for you.
              </p>
            </Feature>
            <Feature>
              <FaBuilding />
              <h3>Discover Departments</h3>
              <p>Find your perfect Major or Minor with ease. And within departments, discover top courses.</p>
            </Feature>
            <Feature>
              <FaUserGraduate />
              <h3>Find Professors</h3>
              <p>
                Uncover accommodating, knowledgeable, and enthusiastic instructors for your next course.  Your new favorite instructor is here.
              </p>
            </Feature>
          </FlexGroup >
        </div> */}
        <HowItWorks />
      </section>
      {/* <section className={styles.pageTop}>
        <CourseCardRow courses={recommendedCourses} />
      </section> */}


    </>
  );
}




{/* <section className={styles.details}>
  <FlexGroup center>
    <Feature>
      <FiBook />
      <h3>Courses</h3>
      <p>
        We have the most comprehensive and up to date course review catalog with
        over 400 courses in 60 departments.
      </p>
    </Feature>
    <Feature>
      <FiEdit2 />
      <h3>Review your courses</h3>
      <p>
        Review all of your courses with one beautiful form. We made the process
        short and painless.
      </p>
    </Feature>
    <Feature>
      <FiThumbsUp />
      <h3>Vote on comments</h3>
      <p>Vote on comments to help the most valuable ones rise to the top.</p>
    </Feature>
    <Feature>
      <FiUser />
      <h3>Professors</h3>
      <p>
        Go beyond courses to look at reviews for individual professors and any
        combination of the two.
      </p>
    </Feature>
  </FlexGroup>
</section>; */}



{/* <Feature>
            <FiUser />
            <h3>Meet Professors</h3>
            <p>
              Look beyond courses to individual professors and find new favorite instructor.
            </p>
          </Feature>
          <Feature>
            <FiEdit2 />
            <h3>Review your courses</h3>
            <p>
              Review all of your courses with one beautiful form. We made the process
              short and painless.
            </p>
          </Feature> */}



// export async function getServerSideProps(context) {

//   const highValueForDifficultyCourses = (await getTopValueForDifficultyCourses(10));

//   return {
//     props: {
//       recommendedCourses: highValueForDifficultyCourses
//     }, // will be passed to the page component as props
//   };
// }
