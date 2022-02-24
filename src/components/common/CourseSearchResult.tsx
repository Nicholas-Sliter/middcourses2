import {public_course} from "../../lib/common/types";
import { MenuItem } from "@chakra-ui/react";
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
    <MenuItem >
      {course.courseName}
    </MenuItem>

  );





}
