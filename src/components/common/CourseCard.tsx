import { Tooltip } from "@chakra-ui/react";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { public_course } from "../../lib/common/types";
import { combind, convertTermToFullString } from "../../lib/frontend/utils";
import styles from "../../styles/components/common/CourseCard.module.scss";
import { CourseRatingBar } from "../RatingBar";

interface CourseCardProps {
  course: public_course;
  showCount?: boolean;
  size?: string;
};

export default function CourseCard({ course, showCount = false, size = "normal" }: CourseCardProps) {

  if (!course) {
    return null;
  }

  const department = course.courseID.substring(0, 4);
  const courseNumber = course.courseID.substring(4);
  const url = `/reviews/${department.toLowerCase()}/${courseNumber}`;
  const reviewText = (course.numReviews == 1) ? 'review' : "reviews";
  const count = (showCount && (course?.numReviews ?? -1 >= 0)) ? <span className={styles.count}>{`${course?.numReviews} ${reviewText}`}</span> : null;


  if (size === "large") {
    return (
      <Link href={url} prefetch={false} passHref>
        <a
          className={combind([styles.container, styles.containerLarge])}
          href={url}>
          <div
            className={styles.cardBody}
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
            <CourseRatingBar course={course} />
            {count}
            {(course?.term) ? <Tooltip label={convertTermToFullString(course?.term)}>
              <span className={styles.term}>
                {course?.term ?? null}
              </span>
            </Tooltip> :
              null}
          </div>
        </a>
      </Link>
    );
  }


  return (
    <Link href={url} prefetch={false} passHref>
      <a
        className={styles.container}
        href={url}>
        <div
          className={styles.cardBody}
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
        </div>
      </a>
    </Link >
  );
}
