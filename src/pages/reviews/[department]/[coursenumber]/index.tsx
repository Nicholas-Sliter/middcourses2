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
import useInstructorsByCourse from "../../../../hooks/useInstructorsByCourse";
import PageTitle from "../../../../components/common/PageTitle";

export default function CoursePage() {
  const router: NextRouter = useRouter();

  const department = router.query.department as string;
  const courseNumber = router.query.coursenumber as string;

  const course = useCourse(department, courseNumber);
  const reviews = useCourseReviews(department, courseNumber)
    ?.reviews as public_review[];
    
  const instructors = useInstructorsByCourse(course?.courseID);

  const [selectedInstructorIDs, setSelectedInstructorIDs] = useState<string[]>([]);
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

  //on load of instructors, select all instructor ids
  useEffect(() => {
    setSelectedInstructorIDs(instructors.map((instructor) => instructor.instructorID));
  }, [instructors, instructors.length, courseNumber, department]);


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
    <PageTitle pageTitle={`${course?.courseName}`} />
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
