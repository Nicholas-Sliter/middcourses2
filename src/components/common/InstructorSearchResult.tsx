import { public_instructor } from "../../lib/common/types";
import { MenuItem } from "@chakra-ui/react";
import Router from "next/router";

interface CourseSearchResultProps {
  compact?: boolean;
  instructor: public_instructor;
}

export default function InstructorSearchResult({
  instructor,
  compact = true,
}: CourseSearchResultProps) {
  // return(
  //   <div>
  //     <p>{course.courseName}</p>
  //   </div>
  // );

  return (
    <MenuItem
      key={instructor.instructorID}
      onClick={() => {
        Router.push(`/instructor/${instructor.slug}`);
      }}
    >
      {instructor.name}
    </MenuItem>
  );
}
