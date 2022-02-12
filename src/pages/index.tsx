import PageTitle from "../components/common/PageTitle";

import styles from "../styles/pages/Home.module.scss";

import Message from "../components/common/Message";
import TextInput  from "../components/common/TextInput";
import Feature from "../components/common/Feature";
import FlexGroup from "../components/common/FlexGroup";
import SignUp from "../components/SignUp";

import { FiBook, FiEdit2, FiThumbsUp, FiUser } from "react-icons/fi";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import SearchBar from "../components/common/SearchBox";

import Review from "../components/Review";

export default function Home() {
  return (
    <>
      <PageTitle pageTitle="Home" />
      <div className={styles.pageTop}>
        {/*<Message type="error" message="Error message" />
        <Message type="info" message="Info message" />
        <Message type="success" message="Success message" />
  <Message type="warning" message="Warning message" /> */}
        {/*<SignUp />*/}
        {/*<Skeleton></Skeleton>*/}
        <Review review={{rating:1}} />
        <SearchBar />
      </div>
      <FlexGroup center>
        <Feature>
          <FiBook />
          <h3>Courses</h3>
          <p>
            We have the most comprehensive and up to date course review catalog
            with over 400 courses in 60 departments.
          </p>
        </Feature>
        <Feature>
          <FiEdit2 />
          <h3>Review your courses</h3>
          <p>
            Review all of your courses with one beautiful form. We made the
            process short and painless.
          </p>
        </Feature>
        <Feature>
          <FiThumbsUp />
          <h3>Vote on comments</h3>
          <p>
            Vote on comments to help the most valuable ones rise to the top.
          </p>
        </Feature>
        <Feature>
          <FiUser />
          <h3>Professors</h3>
          <p>
            Go beyond courses to look at reviews for individual professors and
            any combination of the two.
          </p>
        </Feature>
      </FlexGroup>
    </>
  );
}
