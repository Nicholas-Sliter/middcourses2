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

export default function DepartmentPage({}) {
  const deptCode = useRouter().query.department as string;
  const department = useDepartment(deptCode);
  const reviews = useRecentReviewsByDepartment(deptCode) ?? [];
  const instructors = useInstructorsByDepartment(deptCode) ?? [];
  const courses = useDepartmentCourses(deptCode);

  return (
    <>
      <PageTitle pageTitle={`${department}`} />
      <h2>{department}</h2>
      <h3>Courses:</h3>
      <CourseCardRow courses={courses} />
      <h3>Recent Reviews:</h3>
      <ReviewList
        reviews={reviews}
        instructors={instructors}
        expandable={false}
        identifyCourse
      />
    </>
  );
}
