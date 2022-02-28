import styles from "../styles/components/Review.module.scss";
import DateString from "./common/DateString";
import { FiFlag, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { public_review, public_instructor } from "../lib/common/types";
import Link from "next/link";


import {
  FaRegLaughBeam,
  FaRegLaugh,
  FaRegSmile,
  FaRegMeh,
  FaRegFrown,
  FaRegTired,
} from "react-icons/fa";

import ReviewDetail from "./ReviewDetail";


interface ReviewProps {
  review: public_review;
  instructor: public_instructor;
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

export default function Review({ review, instructor }: ReviewProps) {
  review.rating = Math.floor(Math.random() * 10) + 1;
  return (
    <div key={review.reviewID} className={styles.container}>
      <div className={styles.reviewMain}>
        <span
          className={styles[ratingColorMapping[review.rating]]}
          aria-label="Rating"
          aria-valuetext={`${review.rating} out of 10`}
          title={`${review.rating} out of 10`}
        >
          {ratingIconMapping[review.rating]}
        </span>
        <span>
          {" "}
          with{" "}
          {
            <Link href={`/instructor/${instructor?.slug}`}>
              <a className={styles.instructorLink}>{instructor?.name}</a>
            </Link>
          }
        </span>
        <DateString date={review.reviewDate} titlePrefix="Posted on" />
        <button
          aria-label="Flag Review"
          title="Flag harmful review"
          className={styles.flagButton}
        >
          <FiFlag />
        </button>
        <button
          aria-label="Downvote"
          title="Not helpful"
          className={styles.downvoteButton}
        >
          <FiChevronDown />
        </button>
        <button
          aria-label="Upvote"
          title="Helpful"
          className={styles.upvoteButton}
        >
          <FiChevronUp />
        </button>
        <br />
        <p>{review.content}</p>
      </div>
      <ReviewDetail review={review} />
    </div>
  );
}
