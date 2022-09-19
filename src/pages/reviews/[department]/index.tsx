import { StylesProvider } from "@chakra-ui/react";
import { NextRouter, useRouter } from "next/router";
import PageTitle from "../../../components/common/PageTitle";
import CourseCard from "../../../components/common/CourseCard";
import ReviewList from "../../../components/ReviewList";
import useDepartment from "../../../hooks/useDepartment";
import useDepartmentCourses from "../../../hooks/useDepartmentCourses";
import useInstructorsByDepartment from "../../../hooks/useInstructorsByDepartment";
import useRecentReviewsByDepartment from "../../../hooks/useRecentReviewsByDepartment";
import CourseCardRow from "../../../components/CourseCardRow";
import Instructor from "../../../components/common/Instructor";
import Row from "../../../components/common/Row";
import ScrollableRow from "../../../components/common/ScrollableRow";

export default function DepartmentPage({ }) {
  const deptCode = useRouter().query.department as string;
  const department = useDepartment(deptCode);
  const reviews = useRecentReviewsByDepartment(deptCode) ?? [];
  const instructors = useInstructorsByDepartment(deptCode) ?? [];
  const courses = useDepartmentCourses(deptCode);

  return (
    <>
      <PageTitle pageTitle={`${department}`} />
      <h2>{department}</h2>
      <CourseCardRow courses={courses} />
      <div style={{ marginTop: "-1rem" }}>
        <ScrollableRow>
          {instructors.map((instructor) => (
            <Instructor instructor={instructor} key={instructor.instructorID}></Instructor>
          ))}
        </ScrollableRow>
      </div>
      <h3>Most Recent Reviews:</h3>
      <ReviewList
        reviews={reviews}
        instructors={instructors}
        expandable={false}
        identifyCourse
      />
    </>
  );
}
