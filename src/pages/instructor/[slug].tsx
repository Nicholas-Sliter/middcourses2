import { useRouter } from "next/router";
import PageTitle from "../../components/common/PageTitle";
import CourseCardRow from "../../components/CourseCardRow";
import ReviewList from "../../components/ReviewList";
import useInstructorBySlug from "../../hooks/useInstructorBySlug";
import useInstructorCourses from "../../hooks/useInstructorCourses";
import { useInstructorReviews } from "../../hooks/useInstructorReviews";
import { public_instructor } from "../../lib/common/types";


export default function InstructorPage() {
  const slug = useRouter().query.slug as string;
  const instructor = useInstructorBySlug(slug) as public_instructor | null;
  const courses = useInstructorCourses(slug) ?? [];
  const reviews = useInstructorReviews(slug) ?? [];


  return (
    <>
      <PageTitle pageTitle={`${instructor?.name ?? ""}`} />
      <h2>{instructor?.name}</h2>
      <p>{instructor?.departmentID}</p>
      <span><a href={`mailto://${instructor?.email}`}>{instructor?.email}</a></span>
      <CourseCardRow courses={courses} />
      <ReviewList reviews={reviews} instructors={[instructor]} />
    </>
  );
}
