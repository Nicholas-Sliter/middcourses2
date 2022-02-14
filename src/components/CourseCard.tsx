import { public_course } from "../lib/common/types";
import Link from "next/link";
import styles from "../styles/components/CourseCard.module.scss";

interface CourseCardProps {
  course: public_course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const department = course?.courseID.substring(0, 4);
  const courseNumber = course?.courseID.substring(4);

  return course ? (
    <div className={styles.container}>
      <h1>{course?.courseName}</h1>
      <span>
        <Link href={`/reviews/${department.toLowerCase()}`}>{department}</Link>{" "}
        {courseNumber}
      </span>
      <p>{course?.courseDescription}</p>{" "}
    </div>
  ) : null;
}
