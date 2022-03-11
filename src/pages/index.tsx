import PageTitle from "../components/common/PageTitle";

import styles from "../styles/pages/Home.module.scss";

import Message from "../components/common/Message";
import TextInput  from "../components/common/TextInput";
import Feature from "../components/common/Feature";
import FlexGroup from "../components/common/FlexGroup";
import SignUp from "../components/SignUp";
import { useSession } from "next-auth/react";

import { FiBook, FiEdit2, FiThumbsUp, FiUser } from "react-icons/fi";

import { BiCommentDetail, BiEdit, BiSearch } from "react-icons/bi";
 
import SearchBar from "../components/common/SearchBox";


export default function Home() {
  const session = useSession();

  return (
    <>
      <PageTitle pageTitle="Home" />
      <section className={styles.pageTop}>
        <SearchBar showResultDropdown />
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