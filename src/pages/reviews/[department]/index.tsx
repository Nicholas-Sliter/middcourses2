import { NextRouter, useRouter } from "next/router";
import PageTitle from "../../../components/common/PageTitle";
import ReviewList from "../../../components/ReviewList";
import useDepartment from "../../../hooks/useDepartment";
import useInstructorsByDepartment from "../../../hooks/useInstructorsByDepartment";
import useRecentReviewsByDepartment from "../../../hooks/useRecentReviewsByDepartment";

export default function DepartmentPage({}) {
  const deptCode = useRouter().query.department as string;
  const department = useDepartment(deptCode);
  const reviews = useRecentReviewsByDepartment(deptCode) ?? [];
  const instructors = useInstructorsByDepartment(deptCode) ?? [];

  return (
    <>
      <PageTitle pageTitle={`${department}`} />
      <h1>{department}</h1>
      <ReviewList
        reviews={reviews}
        instructors={instructors}
        expandable={false}
        identifyCourse
      />
    </>
  );
}
