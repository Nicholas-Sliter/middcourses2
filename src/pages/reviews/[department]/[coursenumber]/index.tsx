import { NextRouter, useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import InstructorBadge from "../../../../components/InstructorBadge";
import useCourse from "../../../../hooks/useCourse";
import useCourseReviews from "../../../../hooks/useCourseReviews";
import useInstructors from "../../../../hooks/useInstructors";
import { public_review} from "../../../../lib/common/types";
import ReviewList from "../../../../components/ReviewList";
import CourseCard from "../../../../components/CourseCard";
import BarChart from "../../../../components/BarChart";
import InstructorBar from "../../../../components/InstructorBar";
import AddButton from "../../../../components/common/AddButton";
import AddReview from "../../../../components/AddReview";
import { useDisclosure } from "@chakra-ui/react";

export default function CoursePage() {
  const router: NextRouter = useRouter();

  const department = router.query.department as string;
  const courseNumber = router.query.coursenumber as string;

  const course = useCourse(department, courseNumber);

  const reviews = useCourseReviews(department, courseNumber)
    ?.reviews as public_review[];

  const [instructorIDs, setInstructorIDs] = useState<string[]>([]);
  const instructors = useInstructors(instructorIDs);

  const [selectedInstructorIDs, setSelectedInstructorIDs] = useState<string[]>(
    []
  );
  const [filteredReviews, setFilteredReviews] = useState<public_review[]>([]);

  const { isOpen, onClose, onOpen } = useDisclosure();

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

  //here

  //filter reviews by selected instructors
  useEffect(() => {
    const filtered = reviews.filter((review) =>
      selectedInstructorIDs.includes(review.instructorID)
    );
    setFilteredReviews(filtered);
  }, [
    selectedInstructorIDs,
    reviews,
    reviews.length,
    department,
    courseNumber,
  ]);

  return (
    <>
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
      <AddButton onClick={() => {onOpen()}}></AddButton>
      <AddReview isOpen={isOpen} onClose={onClose} course={course} instructors={instructors} />
    </>
  );
}
