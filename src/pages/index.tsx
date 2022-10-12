import PageTitle from "../components/common/PageTitle";

import styles from "../styles/pages/Home.module.scss";
import Feature from "../components/common/Feature";
import FlexGroup from "../components/common/FlexGroup";
// import { useSession } from "next-auth/react";
import { FaBook, FaBuilding, FaUserGraduate } from "react-icons/fa";
import SearchBar from "../components/common/SearchBox";


export default function Home() {
  //const session = useSession();

  const canonicalURL = "https://midd.courses";

  return (
    <>
      <PageTitle pageTitle="Home" canonicalURL={canonicalURL} />
      <section className={styles.pageTop}>
        <SearchBar showResultDropdown />
        <div style={{ height: '10rem' }}></div>
        <FlexGroup>
          <Feature> {/* link="/browse/courses" */}
            <FaBook />
            <h3>Browse Courses</h3>
            <p>
              MiddCourses is Middlebury&apos;s premier course discovery and review platform.  Browse from our complete catalogue to discover the perfect course for you.
            </p>
          </Feature>
          <Feature> {/* link="/browse/departments" */}
            <FaBuilding />
            <h3>Discover Departments</h3>
            <p>Find your perfect Major or Minor with ease. And within departments, discover top courses.</p>
          </Feature>
          <Feature> {/* link="/browse/instructors" */}
            <FaUserGraduate />
            <h3>Meet Professors</h3>
            <p>
              Find accommodating, knowledgeable, and enthusiastic instructors for your next course.  Your new favorite instructor is here.
            </p>
          </Feature>
        </FlexGroup>
      </section>

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