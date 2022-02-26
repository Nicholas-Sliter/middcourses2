import { public_course } from "../../lib/common/types";
import { MenuItem } from "@chakra-ui/react";
import { RiBook2Line } from "react-icons/ri";
import { FaBook } from "react-icons/fa";
import Router from "next/router";
import styles from "../../styles/components/common/SearchBar.module.scss";


interface CourseSearchResultProps {
  compact?: boolean;
  course: public_course;
}

export default function CourseSearchResult({
  course,
  compact = true,
}: CourseSearchResultProps) {
  // return(
  //   <div>
  //     <p>{course.courseName}</p>
  //   </div>
  // );

  return (
    <MenuItem
      icon={<FaBook />}
      onClick={() => {
        Router.push(
          `/reviews/${course.courseID
            .substring(0, 4)
            .toLowerCase()}/${course.courseID.substring(4)}`
        );
      }}
    >
      {course.courseName} {" "}
      <span className={styles.courseID}>{`${course.courseID.substring(
        0,
        4
      )} ${course.courseID.substring(4)}`}</span>
    </MenuItem>
  );
}
