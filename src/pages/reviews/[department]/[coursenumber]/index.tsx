
import { NextRouter, useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import InstructorBadge from "../../../../components/InstructorBadge";
import useCourse from "../../../../hooks/useCourse";
import useCourseReviews from "../../../../hooks/useCourseReviews";
import useInstructors from "../../../../hooks/useInstructors";
import { public_review, public_instructor } from "../../../../lib/common/types";
import { lastNameInstructorSort } from "../../../../lib/frontend/utils";
import ReviewList from "../../../../components/ReviewList";
import CourseCard from "../../../../components/CourseCard";

export default function CoursePage() {
  const router: NextRouter = useRouter();
  const { department, courseNumber }: any = router.query;
  //useState<public_instructor[]>([]);

  const course = useCourse(department, courseNumber);

  const reviews = useCourseReviews(department, courseNumber)?.reviews as
    public_review[];

  const [instructorIDs, setInstructorIDs] = useState<string[]>([]);
  const [instructors, setInstructors] = useState<public_instructor[]>([]);
  
  useEffect(() => {
    const arr = reviews.map((review) => review.instructorID);
    setInstructorIDs(arr);
  }, [reviews.length, department, courseNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function fetchInstructors() {
      //this set actually doesn't do anything since the instructors are objects
    const instructorSet = new Set<public_instructor>();
    instructorIDs.forEach(async (id) => {
      const res = await fetch (`/api/instructor/id/${id}`);
      if (!res.ok) {
        return;
      }
      const instructor = (await res.json())?.instructor as public_instructor;
      instructorSet.add(instructor);
      setInstructors([...instructorSet]);
    });
  }
  fetchInstructors();
  }, [instructorIDs]);


  //const instructors = useInstructors(instructorIDs);

  return (
    <div>
      <CourseCard course={course} />
      <hr />
     {instructorIDs.map((id) => (
       //note: this only shows the instructors who have reviews
       //use the CourseIntructors table to get all instructors
        <InstructorBadge key={id} id={id} />)
      )}
      <div>
        <h2>Reviews</h2>
        {(reviews?.length) ? <ReviewList reviews={reviews} instructors={instructors} /> : null}
      </div>
    </div>
  );
}
