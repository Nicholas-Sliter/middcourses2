import { useState } from "react";
import { public_review } from "../../lib/common/types";
import {
  FiClock,
  FiLayers,
  FiBarChart,
  FiMaximize,
  FiChevronsDown,
  FiChevronsUp,
} from "react-icons/fi";
import { MdOutlineThumbUp, MdOutlineThumbDown } from "react-icons/md";
import { FaHandsHelping, FaRegGem } from "react-icons/fa";
import {
  valueMapping,
  difficultyMapping,
  getRelativeDifferenceText,
  getRelativeDifferenceColor,
  relativeDifference,
} from "../../lib/frontend/utils";

import styles from "./ReviewDetail.module.scss";
import { primaryComponents, toTitleCase } from "../../lib/common/utils";

interface ReviewDetailProps {
  review: public_review;
  averages?: {
    hours: number;
    difficulty: number;
    value: number;

    instructorEffectiveness: number;
    instructorAccomodationLevel: number;
    instructorEnthusiasm: number;
  };
  expandable?: boolean;
}

interface ReviewDetailNumericalElementProps {
  title: string;
  value: number;
  average: number;
  positiveGood?: boolean;
  outOf?: number | null;
}

function ReviewDetailNumericalElement({
  text,
  value,
  average,
  positiveGood = true,
  outOf = null,
}) {
  const relativeDiff = relativeDifference(value, average);
  const relativeDiffText = getRelativeDifferenceText(value, average);
  const relativeDiffColor = getRelativeDifferenceColor(
    relativeDiff,
    positiveGood
  );

  const outOfString = outOf ? `/${outOf} ` : " ";

  //if value or average is undefined, return null, but dont return null if 0
  if (value === undefined || average === undefined) {
    return null;
  }

  return (
    <div key={text}>
      <b>{text}: </b>
      {value}
      {outOfString}
      <span
        className={styles.difference}
        style={{
          backgroundColor: relativeDiffColor,
        }}
        title={`${relativeDiffText}`}
      >
        {`${relativeDiff}%`}
      </span>
    </div>
  );
}

function ReviewDetailFull({ review, averages }) {
  return (
    <>
      <hr className={styles.separator} />
      <div className={styles.full}>
        <ReviewDetailNumericalElement
          text="Hours per week"
          value={review?.hours}
          average={averages?.hours}
          positiveGood={false}
        />
        <ReviewDetailNumericalElement
          text={difficultyMapping[review?.difficulty] + " difficulty"}
          value={review?.difficulty}
          average={averages?.difficulty}
          positiveGood={false}
          outOf={10}
        />
        <ReviewDetailNumericalElement
          text={valueMapping[review?.value] + " value"}
          value={review?.value}
          average={averages?.value}
          positiveGood={true}
          outOf={10}
        />
      </div>
    </>
  );
}

function ReviewDetailBar({ review }: { review: public_review }) {
  const hours =
    review?.hours || review?.hours == 0 ? (
      <span>
        <FiClock /> {`${review?.hours}hrs / week`}
      </span>
    ) : null;

  const difficulty =
    review?.difficulty || review?.difficulty == 0 ? (
      <span title="Difficulty">
        <FiBarChart /> {`${difficultyMapping[review?.difficulty]} difficulty`}
      </span>
    ) : null;

  const value =
    review?.value || review?.value == 0 ? (
      <span title="Value">
        <FaRegGem /> {`${valueMapping[review?.value]} value`}
      </span>
    ) : null;

  const again =
    review?.again || review?.again == false ? (
      <span title="Would take again">
        {review?.again ? (
          <>
            <MdOutlineThumbUp className={styles.again} />
            {" Would take again"}
          </>
        ) : (
          <>
            <MdOutlineThumbDown className={styles.notAgain} />
            {` Would not take again`}
          </>
        )}

      </span>
    ) : null;

  return (
    <div className={styles.bar}>
      {hours}
      {difficulty}
      {value}
      {again}
    </div>
  );
}

export default function ReviewDetail({
  review,
  averages,
  expandable = false,
}: ReviewDetailProps) {
  const [isOpen, setIsOpen] = useState(false);

  const expandButton = expandable ? (
    <button
      title={isOpen ? "Close Review" : "Expand review"}
      className={styles.openButton}
      aria-expanded={isOpen}
      onClick={() => setIsOpen(!isOpen)}
    >
      {isOpen ? <FiChevronsUp /> : <FiChevronsDown />}
    </button>
  ) : null;

  return (
    <div className={styles.container}>
      {isOpen ? (
        <div className={styles.bar}>
          <span> </span>
        </div>
      ) : (
        <ReviewDetailBar review={review} />
      )}
      {expandButton}
      {isOpen ? (
        <ReviewDetailFull
          review={review}
          averages={{ hours: 14, difficulty: 8, value: 7 }}
        />
      ) : (
        <></>
      )}
    </div>
  );
}
