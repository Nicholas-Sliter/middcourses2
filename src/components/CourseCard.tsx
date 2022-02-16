import { public_course } from "../lib/common/types";
import Link from "next/link";
import styles from "../styles/components/CourseCard.module.scss";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


interface CourseCardProps {
  course: public_course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const department = course?.courseID.substring(0, 4);
  const courseNumber = course?.courseID.substring(4);

  return (
    <div className={styles.container}>
      <h1>{course?.courseName || <Skeleton />}</h1>
      {(courseNumber) ? <span>
        <Link href={`/reviews/${department.toLowerCase()}`}>{department}</Link>{" "}
        {courseNumber}
      </span> : <Skeleton count={5} />}
      <p>{course?.courseDescription || <Skeleton />}</p>{" "}
    </div>
  );
}
