import styles from "../styles/components/CourseCardRow.module.scss";
import CourseCard from "./common/CourseCard";


export default function CourseCardRow({courses}){


  return(
    <div className={styles.container}>
      {courses.map((course) => (
        <CourseCard course={course} key={course.courseID} />
      ))}
    </div>
  );




}