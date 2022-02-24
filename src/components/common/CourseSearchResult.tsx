import {public_course} from "../../lib/common/types";

interface CourseSearchResultProps {
  compact?: boolean;
  course: public_course;
}

export default function CourseSearchResult({
  course,
  compact = true,
}: CourseSearchResultProps) {

  return(
    <div>
      <p>{course.courseName}</p>
    </div>
  );



}
