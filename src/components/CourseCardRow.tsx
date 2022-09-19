import { public_course } from "../lib/common/types";
import styles from "../styles/components/CourseCardRow.module.scss";
import CourseCard from "./common/CourseCard";
import ScrollableRow from "./common/ScrollableRow";

interface CourseCardRowProps {
  courses: public_course[];
  showCount?: boolean;
}


export default function CourseCardRow({ courses, showCount = false }: CourseCardRowProps) {

  return (
    <ScrollableRow>
      {courses?.map((course: public_course) => (
        <CourseCard course={course} key={course.courseID + course?.term} showCount={showCount} />
      ))}
    </ScrollableRow>

  )

}