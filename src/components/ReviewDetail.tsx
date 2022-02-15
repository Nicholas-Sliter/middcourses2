import { useState } from "react";
import { public_review } from "../lib/common/types";
import {
  FiClock,
  FiLayers,
  FiBarChart,
  FiMaximize,
  FiChevronsDown,
  FiChevronsUp,
} from "react-icons/fi";
import { FaRegGem } from "react-icons/fa";
import styles from "../styles/components/ReviewDetail.module.scss";

interface ReviewDetailProps {
  review: public_review;
}

const difficultyMapping = {
  1: "Extremely low",
  2: "Very low",
  3: "Low",
  4: "Low",
  5: "Average",
  6: "Some",
  7: "Very ",
  8: "Extremely",
  9: "Hardcore",
  10: "Impossible",
};

const valueMapping = {
  1: "Extremely low",
  2: "Very low",
  3: "Low",
  4: "Low",
  5: "Average",
  6: "Somewhat high",
  7: "Very high",
  8: "Extremely high",
  9: "Extremely high",
  10: "Extremely high",
};

function ReviewDetailFull({ review }) {
  return (
  <>
  <hr className={styles.separator} />
  <div className={styles.full}>
  </div>
  </>);
}

function ReviewDetailBar({ review }) {
  return (
    <div className={styles.bar}>
      <span>
        <FiClock /> {`${review?.hours}hrs / week`}
      </span>
      <span title="Difficulty">
        <FiBarChart /> {`${difficultyMapping[review?.difficulty]} difficulty`}
      </span>
      <span>
        <FaRegGem /> {`${valueMapping[review?.value]} value`}
      </span>
      <span>
        <FiLayers /> {`${review?.primaryComponent}-based`}
      </span>
      {/**      <button
        title="Expand review"
        className={styles.openButton}
        aria-expanded={false}
      >
        <FiChevronsDown />
</button> */}
    </div>
  );
}

export default function ReviewDetail({ review }: ReviewDetailProps) {
  const [isOpen, setIsOpen] = useState(false);

  const expandButton = (
    <button
      title={isOpen ? "Close Review" : "Expand review"}
      className={styles.openButton}
      aria-expanded={isOpen}
      onClick={() => setIsOpen(!isOpen)}
    >
      {isOpen ? <FiChevronsUp /> : <FiChevronsDown />}
    </button>
  );

  return (
    <div className={styles.container}>
      {isOpen ? (
        <div className={styles.bar}>
            <span>{" "}</span>
         </div>
      ) : (
        <ReviewDetailBar review={review} />
      )}
      {expandButton}
      {isOpen ? <ReviewDetailFull review={review} /> : <></>}
    </div>
  );
}
