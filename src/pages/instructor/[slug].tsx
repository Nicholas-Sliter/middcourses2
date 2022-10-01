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
      instructor: data.instructor,
      courses: data.courses,
      reviews: JSON.parse(JSON.stringify(data.reviews)),
      authorized: authorized,
    },
  };

}



export default function InstructorPage({ slug, instructor, courses, reviews, authorized }) {

  return (
    <>
      <PageTitle pageTitle={`${instructor?.name ?? ""}`} />
      <BrowserView>
        <SidebarLayout>
          <SidebarLayout.Sidebar>
            <InstructorCard instructor={instructor} authorized={authorized} />
            {(instructor.departmentID && instructor.departmentName) ?

              <Link
                href={`/reviews/${instructor.departmentID}`}
                passHref
              >
                <a style={{ color: "#333", marginRight: 'auto', marginLeft: 'auto' }}><TbArrowBackUp /> {instructor.departmentName} department</a>
              </Link> : null}

          </SidebarLayout.Sidebar>
          <SidebarLayout.Main>
            <CourseCardRow courses={courses} />
            <ReviewList reviews={reviews} instructors={[instructor]} identifyInstructor={false} identifyCourse context="instructor" />
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
