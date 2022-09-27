import styles from "./Review.module.scss";
import DateString from "../common/DateString";
import { FiFlag, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { public_review, public_instructor } from "../../lib/common/types";
import Link from "next/link";
import { Tooltip, useToast } from "@chakra-ui/react";


import {
  FaRegLaughBeam,
  FaRegLaugh,
  FaRegSmile,
  FaRegMeh,
  FaRegFrown,
  FaRegTired,
} from "react-icons/fa";

import ReviewDetail from "./ReviewDetail";
import ReadMore from "../common/ReadMore";
import voteFetch from "../../lib/frontend/vote";
import { useState } from "react";
import {
  MdThumbUp,
  MdThumbDown,
  MdThumbUpOffAlt,
  MdThumbDownOffAlt,
} from "react-icons/md";
import { ratingMapping } from "../../lib/frontend/utils";


interface ReviewProps {
  review: public_review;
  instructor: public_instructor;
  expandable?: boolean;
  identifyCourse?: boolean;
  identifyInstructor?: boolean;
  hideVoting?: boolean;
}

//map the ratings from 1-10 to emoji icons
const ratingIconMapping = {
  1: <FaRegTired />,
  2: <FaRegFrown />,
  3: <FaRegFrown />,
  4: <FaRegMeh />,
  5: <FaRegMeh />,
  6: <FaRegSmile />,
  7: <FaRegSmile />,
  8: <FaRegLaugh />,
  9: <FaRegLaugh />,
  10: <FaRegLaughBeam />,
};

const ratingColorMapping = {
  1: "red",
  2: "red",
  3: "orange",
  4: "orange",
  5: "yellow",
  6: "yellow",
  7: "light-green",
  8: "light-green",
  9: "green",
  10: "green",
};

const votingWithoutLoginToast = (toast) => {
  toast({
    title: "You must be logged in to vote",
    status: "error",
    duration: 5000,
    isClosable: true,
  });
};

const vote = async (review: public_review, voteType: string, toast, updateVoteType) => {
  const { status, message, value } = await voteFetch(review.reviewID, voteType);
  if (status) {
    //update the review with the new value
    //review.userVoteType = value;
    updateVoteType(value);
    review.userVoteType = value;
    toast({
      title: message,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }
  else {
    toast({
      title: message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });

  }

  //votingWithoutLoginToast(toast);

}

export default function ReviewCard({
  review,
  instructor,
  expandable = true,
  identifyCourse = false,
  identifyInstructor = true,
  hideVoting = false,
}: ReviewProps) {
  //chnage to like dislike icons

  const [userVoteType, setUserVoteType] = useState(review.userVoteType);
  const department = review?.courseID?.slice(0, 4)?.toLowerCase();
  const courseNumber = review?.courseID?.slice(4);
  const toast = useToast();

  if (!department || !courseNumber) {
    return null;
  }

  const instructorElement = (identifyInstructor) ? (<>{" with "} <Link href={`/instructor/${instructor?.slug}`}>
    <a className={styles.instructorLink}>{instructor?.name}</a>
  </Link></>) : "";

  const LikeIcon = () => (userVoteType === 1) ? <MdThumbUp /> : <MdThumbUpOffAlt />;
  const DislikeIcon = () => (userVoteType === -1) ? <MdThumbDown /> : <MdThumbDownOffAlt />;

  const LikeDislikeElement = () => (hideVoting) ? null : (
    <><Tooltip label={`${(userVoteType === -1) ? "Remove " : ""}Downvote`}>

      <button
        aria-label="Downvote"
        //title="Not helpful"
        className={`${styles.downvoteButton} ${(userVoteType === -1) ? styles.downvoted : ""}`}
        onClick={() => vote(review, "down", toast, setUserVoteType)}
      >
        <DislikeIcon />
      </button>
    </Tooltip>
      <Tooltip label={`${(userVoteType === 1) ? "Remove " : ""}Upvote`}>
        <button
          aria-label="Upvote"
          //title="Helpful"
          className={`${styles.upvoteButton} ${(userVoteType === 1) ? styles.upvoted : ""}`}
          onClick={() => vote(review, "up", toast, setUserVoteType)}
        >
          <LikeIcon />
        </button>
      </Tooltip>
    </>

  );



  return (
    <div key={review.reviewID} className={styles.container}>
      <div className={styles.reviewMain}>
        <Tooltip placement="right" label={`${ratingMapping[review.rating]}: ${review.rating} out of 10`}>
          <span
            className={styles[ratingColorMapping[review.rating]]}
            aria-label="Rating"
            aria-valuetext={`${review.rating} out of 10`}
          //title={`${review.rating} out of 10`}
          >
            {ratingIconMapping[review.rating]}
          </span>
        </Tooltip>
        <span>
          {" "}
          {identifyCourse ? (
            <Link href={`/reviews/${department}/${courseNumber}`}>
              <a>{review.courseID}</a>
            </Link>
          ) : (
            ""
          )}
          {instructorElement}
        </span>
        <DateString date={review.reviewDate} titlePrefix="Posted on" />
        <Tooltip label="Flag harmful review">
          <button
            aria-label="Flag Review"
            //title="Flag harmful review"
            className={styles.flagButton}
          >
            <FiFlag />
          </button>
        </Tooltip>
        <LikeDislikeElement />
        <br />
        <ReadMore text={review.content} maxLength={256} />
      </div>
      <ReviewDetail review={review} expandable={expandable} />
    </div>
  );
}
