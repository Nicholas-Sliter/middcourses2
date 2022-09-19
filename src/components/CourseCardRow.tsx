import { public_course } from "../lib/common/types";
import styles from "../styles/components/CourseCardRow.module.scss";
import CourseCard from "./common/CourseCard";
import ScrollableRow from "./common/ScrollableRow";


export default function CourseCardRow({ courses }) {



  return (
    <ScrollableRow>
      {courses?.map((course: public_course) => (
        <CourseCard course={course} key={course.courseID + course?.term} />
      ))}
    </ScrollableRow>

  )

}