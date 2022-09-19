import { getSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { TbArrowBackUp } from "react-icons/tb";
import PageTitle from "../../components/common/PageTitle";
import CourseCardRow from "../../components/CourseCardRow";
import { BrowserView, MobileView } from "../../components/DeviceViews";
import Main from "../../components/Main";
import ReviewList from "../../components/ReviewList";
import Sidebar from "../../components/Sidebar";
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
  const data = await optimizedSSRInstructorPage(slug, authorized);

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
          <Sidebar>
            <div>
              <h2>{instructor?.name}</h2>
              <p>{instructor?.departmentID}</p>
              {(authorized) ? <span><a href={`mailto://${instructor?.email}`}>{instructor?.email}</a></span> : null}
            </div>

            {(instructor.departmentID && instructor.departmentName) ?

              <Link
                href={`/reviews/${instructor.departmentID}`}
                passHref
              >
                <a style={{ color: "#333", marginRight: 'auto', marginLeft: 'auto' }}><TbArrowBackUp /> {instructor.departmentName} department</a>
              </Link> : null}

          </Sidebar>
          <Main>
            <CourseCardRow courses={courses} />
            <ReviewList reviews={reviews} instructors={[instructor]} identifyInstructor={false} />
          </Main>
        </SidebarLayout>
      </BrowserView>
      <MobileView>
        <div>
          <h2>{instructor?.name}</h2>
          <p>{instructor?.departmentID}</p>
          {(authorized) ? <span><a href={`mailto://${instructor?.email}`}>{instructor?.email}</a></span> : null}
        </div>
        <CourseCardRow courses={courses} />
        <ReviewList reviews={reviews} instructors={[instructor]} identifyInstructor={false} />
      </MobileView>
    </>
  );
}
