import { public_course } from "../lib/common/types";
import styles from "../styles/components/CourseCardRow.module.scss";
import CourseCard from "./common/CourseCard";
import ScrollableRow from "./common/ScrollableRow";

interface CourseCardRowProps {
  courses: public_course[];
  showCount?: boolean;
  size?: string;
}


export default function CourseCardRow({ courses, showCount = false, size = "normal" }: CourseCardRowProps) {

  return (
    <ScrollableRow className={styles.scrollRow}>
      {courses?.map((course: public_course) => (
        <CourseCard course={course} key={course.courseID + course?.term} showCount={showCount} size={size} />
      ))}
    </ScrollableRow>

  )

}