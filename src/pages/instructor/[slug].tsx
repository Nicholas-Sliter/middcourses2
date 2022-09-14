import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import PageTitle from "../../components/common/PageTitle";
import CourseCardRow from "../../components/CourseCardRow";
import ReviewList from "../../components/ReviewList";
import useInstructorBySlug from "../../hooks/useInstructorBySlug";
import useInstructorCourses from "../../hooks/useInstructorCourses";
import { useInstructorReviews } from "../../hooks/useInstructorReviews";
import { getCoursesByInstructorSlug, getInstructorBySlug, getRecentReviewsByInstructor } from "../../lib/backend/database-utils";
import { CustomSession, public_course, public_instructor, public_review } from "../../lib/common/types";


export async function getServerSideProps(context) {
  const slug = context.query.slug as string;
  const session = await getSession(context) as CustomSession;
  const authorized = session?.user?.authorized ?? false;

  const [instructor, courses, reviews]:
    [public_instructor, public_course[], public_review[]] = await Promise.all([
      getInstructorBySlug(slug) ?? [],
      getCoursesByInstructorSlug(slug) ?? [],
      (authorized) ? getRecentReviewsByInstructor(slug, 5) : [],
    ])

  return {
    props: {
      slug: slug,
      instructor: instructor,
      courses: courses,
      reviews: reviews,
      authorized: authorized,
    },
  };

}



export default function InstructorPage({ slug, instructor, courses, reviews, authorized }) {

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
