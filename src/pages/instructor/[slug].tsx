import { Avatar, styled } from "@chakra-ui/react";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { TbArrowBackUp } from "react-icons/tb";
import InstructorCard from "../../components/common/InstructorCard";
import PageTitle from "../../components/common/PageTitle";
import CourseCardRow from "../../components/CourseCardRow";
import { BrowserView, MobileView } from "../../components/DeviceViews";
import ReviewList from "../../components/Review";
import useInstructorBySlug from "../../hooks/useInstructorBySlug";
import useInstructorCourses from "../../hooks/useInstructorCourses";
import { useInstructorReviews } from "../../hooks/useInstructorReviews";
import SidebarLayout from "../../layouts/SidebarLayout";
import { getCoursesByInstructorSlug, getInstructorBySlug, getRecentReviewsByInstructor } from "../../lib/backend/database-utils";
import { optimizedSSRInstructorPage } from "../../lib/backend/database/instructor";
import { CustomSession, public_course, public_instructor, public_review } from "../../lib/common/types";


export async function getServerSideProps(context) {
  const slug = context.query.slug as string;
  const session = await getSession(context) as CustomSession;
  const authorized = session?.user?.authorized ?? false;
  const data = await optimizedSSRInstructorPage(slug, session);

  return {
    props: {
      slug: slug,
      instructor: JSON.parse(JSON.stringify(data.instructor)),
      courses: data.courses,
      reviews: JSON.parse(JSON.stringify(data.reviews)),
      authorized: authorized,
    },
  };

}



export default function InstructorPage({ slug, instructor, courses, reviews, authorized }) {


  const threeRecentUniqueCourseNames = Array.from(new Set(courses.map((course) => course.courseName))).slice(0, 3).join(", ");

  const coursesDescription = (threeRecentUniqueCourseNames) ? `${instructor.name} teaches ${threeRecentUniqueCourseNames} and more.` : `${instructor.name} has not taught any courses yet.`;
  const metaDescription = (instructor?.name) ? `Reviews and ratings for ${instructor.name} at Middlebury College. ${coursesDescription}  Explore top rated instructors and find the best for you. Is ${instructor.name} good? Find out on MiddCourses.` : "";


  return (
    <>
      <PageTitle pageTitle={`${instructor?.name ?? ""}`} description={metaDescription} />
      <BrowserView>
        <SidebarLayout>
          <SidebarLayout.Sidebar>
            <InstructorCard instructor={instructor} authorized={authorized} />
            {(instructor.departmentID && instructor.departmentName) ?

              <Link
                href={`/reviews/${instructor.departmentID.toLowerCase()}`}
                passHref
              >
                <a style={{ color: "#333", marginRight: 'auto', marginLeft: 'auto' }}><TbArrowBackUp /> {instructor.departmentName} department</a>
              </Link> : null}

          </SidebarLayout.Sidebar>
          <SidebarLayout.Main>
            <CourseCardRow courses={courses} showCount />
            <ReviewList reviews={reviews} instructors={[instructor]} identifyInstructor={false} identifyCourse context="instructor" requireAuth={false} />
          </SidebarLayout.Main>
        </SidebarLayout>
      </BrowserView>
      <MobileView>
        <InstructorCard instructor={instructor} authorized={authorized} />
        <CourseCardRow courses={courses} />
        <ReviewList reviews={reviews} instructors={[instructor]} identifyInstructor={false} identifyCourse context="instructor" />
      </MobileView>
    </>
  );
}
