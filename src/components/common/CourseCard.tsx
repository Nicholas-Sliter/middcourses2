import { Tooltip } from "@chakra-ui/react";
import Link from "next/link";
import router, { Router } from "next/router";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { public_course } from "../../lib/common/types";
import { combind, convertTermToFullString } from "../../lib/frontend/utils";
import styles from "../../styles/components/common/CourseCard.module.scss";
import RatingBar, { CourseRatingBar } from "../RatingBar";
import RatingBox from "../RatingBox";

interface CourseCardProps {
  course: public_course;
  showCount?: boolean;
  size?: string;
};

export default function CourseCard({ course, showCount = false, size = "normal" }: CourseCardProps) {
  const department = course.courseID.substring(0, 4);
  const courseNumber = course.courseID.substring(4);
  const url = `/reviews/${department.toLowerCase()}/${courseNumber}`;
  const reviewText = (course.numReviews == 1) ? 'review' : "reviews";
  const count = (showCount && (course?.numReviews ?? -1 >= 0)) ? <span className={styles.count}>{`${course?.numReviews} ${reviewText}`}</span> : null;


  if (size === "large") {
    return (
      <div className={combind([styles.container, styles.containerLarge])}>
        <button
          className={styles.cardBody}
          onClick={() => router.push(url)}
        >
          <h5>{course.courseName}</h5>
          {courseNumber ? (
            <span>
              {department}{" "}{courseNumber}
            </span>
          ) : (
            <Skeleton count={1} />
          )}
          <p>{course.courseDescription}</p>
          {/* <RatingBar >
            <RatingBox value={course.avgRating} title="Rating" highIsGood suffix="/10" />
            <RatingBox value={course.avgValue} title="Value" highIsGood suffix="/10" />
            <RatingBox value={course.avgAgain} title="Again" highIsGood min={0} max={1} percent suffix="%" displayPrecision={0} />
          </RatingBar> */}
          <CourseRatingBar course={course} />
          {count}
          {(course?.term) ? <Tooltip label={convertTermToFullString(course?.term)}>
            <span className={styles.term}>
              {course?.term ?? null}
            </span>
          </Tooltip> :
            null}
        </button>
      </div>
    );
  }






  return (
    <div className={styles.container}>
      <button
        className={styles.cardBody}
        onClick={() => router.push(url)}
      >
        <h5>{course.courseName}</h5>
        {courseNumber ? (
          <span>
            {department}{" "}{courseNumber}
          </span>
        ) : (
          <Skeleton count={1} />
        )}
        <p>{course.courseDescription}</p>
        {count}
        {(course?.term) ? <Tooltip label={convertTermToFullString(course?.term)}>
          <span className={styles.term}>
            {course?.term ?? null}
          </span>
        </Tooltip> :
          null}
      </button>
    </div>
  );
}
