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
import BarChart from "../../../../components/BarChart";
import InstructorBar from "../../../../components/InstructorBar";

export default function CoursePage() {
  const router: NextRouter = useRouter();

  const department = router.query.department as string;
  const courseNumber = router.query.coursenumber as string;

  const course = useCourse(department, courseNumber);

  const reviews = useCourseReviews(department, courseNumber)
    ?.reviews as public_review[];

  const [instructorIDs, setInstructorIDs] = useState<string[]>([]);
  const [instructors, setInstructors] = useState<public_instructor[]>([]);

  const [selectedInstructorIDs, setSelectedInstructorIDs] = useState<string[]>(
    []
  );

  const [filteredReviews, setFilteredReviews] = useState<public_review[]>([]);

  const selectInstructor = (instructorID: string) => {
    const selected = [...new Set([...selectedInstructorIDs, instructorID])];
    setSelectedInstructorIDs(selected);
  };

  const deselectInstructor = (instructorID: string) => {
    const selected = selectedInstructorIDs.filter((id) => id !== instructorID);
    setSelectedInstructorIDs(selected);
  };

  //get instructor ids
  useEffect(() => {
    const arr = reviews.map((review) => review.instructorID);
    setInstructorIDs(arr);
    setSelectedInstructorIDs(arr); //anytime we go to new page, show all instructors as default
  }, [reviews.length, department, courseNumber]); // eslint-disable-line react-hooks/exhaustive-deps


  //get instructors
  useEffect(() => {
    async function fetchInstructors() {
      //this set actually doesn't do anything since the instructors are objects
      const instructorSet = new Set<public_instructor>();
      instructorIDs.forEach(async (id) => {
        const res = await fetch(`/api/instructor/id/${id}`);
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


  //filter reviews by selected instructors
  useEffect(() => {
    const filtered = reviews.filter((review) =>
      selectedInstructorIDs.includes(review.instructorID)
    );
    setFilteredReviews(filtered);

  }, [selectedInstructorIDs]);


  return (
    <div>
      <CourseCard course={course} />
      <hr />
      <InstructorBar
        instructors={instructors}
        selected={selectedInstructorIDs}
        select={selectInstructor}
        deselect={deselectInstructor}
      />
      <div>
        <ReviewList reviews={filteredReviews} instructors={instructors} />
      </div>
    </div>
  );
}

// {
//   instructorIDs.map((id) => (
//     //note: this only shows the instructors who have reviews
//     //use the CourseIntructors table to get all instructors
//     <InstructorBadge key={id} id={id} />
//   ));
// }
