import { route } from "next/dist/server/router";
import Link from "next/link";
import router, { Router } from "next/router";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { public_course } from "../../lib/common/types";
import styles from "../../styles/components/common/CourseCard.module.scss";

interface CourseCardProps {
  course: public_course;
};

export default function CourseCard({course}: CourseCardProps){
  const department = course.courseID.substring(0, 4);
  const courseNumber = course.courseID.substring(4);
  const url = `/reviews/${department.toLowerCase()}/${courseNumber}`;
  //const n = Math.floor(Math.random() * 50000 *(1/parseInt(courseNumber,10)));
  // {`${n} reviews`}
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
        {/*<Link href={url}>
          <a className={styles.link}>{"View reviews"}</a>
        </Link>*/}
        <span className={styles.term}>
          {course?.term ?? null}
        </span>
      </button>
    </div>
  );
}


// <p>{course.courseDescription}</p>