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

  if (!data || !data.instructor) {
    return {
      notFound: true,
    };
  }

  const mobileUserAgent = context.req.headers["user-agent"].toLowerCase().includes("mobile");

  const remainingReviews = data.instructor.numReviews - 3;
  const remainingReviewsText = `${remainingReviews > 0 ? remainingReviews + " " : ""}`;

  let reviewListMessage = "";
  if (!data.reviews.length) {
    reviewListMessage = "";
  }
  else if (!session) {
    reviewListMessage = `Login to access ${remainingReviewsText}more reviews of ${data.instructor.name ?? "this instructor"}`;
  }
  else if (!authorized) {
    reviewListMessage = `Review at least 2 courses to access ${remainingReviewsText}more reviews of ${data.instructor.name ?? "this instructor"}`;
  }

  const threeRecentUniqueCourseNames = Array.from(new Set(data.courses.map((course) => course.courseName))).slice(0, 3).join(", ");

  const coursesDescription = (threeRecentUniqueCourseNames) ? `${data.instructor.name} teaches ${threeRecentUniqueCourseNames} and more.` : `${data.instructor.name} has not taught any courses yet.`;
  const metaDescription = (data.instructor?.name) ? `Reviews and ratings for ${data.instructor.name} at Middlebury College.${coursesDescription}  Explore top rated instructors and find the best for you.Is ${data.instructor.name} good ? Find out on MiddCourses.` : "";

  const canonicalURL = `https://midd.courses/instructor/${slug}`;



  return {
    props: {
      slug: slug,
      instructor: JSON.parse(JSON.stringify(data.instructor)),
      courses: data.courses,
      reviews: JSON.parse(JSON.stringify(data.reviews)),
      authorized: authorized,
      mobileUserAgent: mobileUserAgent,
      reviewListMessage: reviewListMessage,
      metaDescription: metaDescription,
      canonicalURL: canonicalURL
    },
  };

}



export default function InstructorPage({ slug, instructor, courses, reviews, authorized, mobileUserAgent, reviewListMessage, metaDescription, canonicalURL }) {



  return (
    <>
      <PageTitle
        pageTitle={`${instructor?.name ?? ""}`}
        description={metaDescription}
        canonicalURL={canonicalURL}
      />
      <BrowserView renderDefault={!mobileUserAgent}>
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
            <ReviewList
              reviews={reviews}
              instructors={[instructor]}
              identifyInstructor={false}
              identifyCourse
              context="instructor"
              requireAuth={false}
              message={reviewListMessage}
            />
          </SidebarLayout.Main>
        </SidebarLayout>
      </BrowserView>
      <MobileView renderDefault={mobileUserAgent}>
        <InstructorCard instructor={instructor} authorized={authorized} showBottomBorder />
        <CourseCardRow courses={courses} showCount />
        <ReviewList
          reviews={reviews}
          instructors={[instructor]}
          identifyInstructor={false}
          identifyCourse
          context="instructor"
          requireAuth={false}
          message={reviewListMessage}
        />
      </MobileView>
    </>
  );
}
