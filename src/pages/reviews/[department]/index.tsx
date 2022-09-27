import PageTitle from "../../../components/common/PageTitle";
import ReviewList from "../../../components/Review";
import CourseCardRow from "../../../components/CourseCardRow";
import Instructor from "../../../components/common/Instructor";
import ScrollableRow from "../../../components/common/ScrollableRow";
import { getSession } from "next-auth/react";
import { CustomSession, public_course, public_instructor, public_review } from "../../../lib/common/types";
import { optimizedSSRDepartmentPage } from "../../../lib/backend/database/departments";
import { BrowserView, MobileView } from "../../../components/DeviceViews";
import SidebarLayout from "../../../layouts/SidebarLayout";

interface DepartmentPageProps {
  departmentID: string;
  departmentName: string;
  courses: public_course[];
  instructors: public_instructor[];
  reviews: public_review[];
  authorized: boolean;
}

export async function getServerSideProps(context) {
  const departmentID = context.query.department as string;
  console.log(departmentID);
  const session = await getSession(context) as CustomSession;

  const data = await optimizedSSRDepartmentPage(departmentID.toUpperCase(), session?.user?.authorized ?? false);

  return {
    props: {
      departmentID: departmentID,
      departmentName: data.departmentName,
      courses: data.courses,
      instructors: data.instructors,
      reviews: JSON.parse(JSON.stringify(data.reviews)),
      authorized: session?.user?.authorized ?? false,
    }
  }
}

export default function DepartmentPage({
  departmentID,
  departmentName,
  courses,
  instructors,
  reviews,
  authorized,
}: DepartmentPageProps) {

  const numReviewSum = courses.reduce((acc, curr) => acc + parseInt(curr.numReviews as string, 10), 0);
  const reviewText = numReviewSum === 1 ? "review" : "reviews";

  return (
    <>
      <PageTitle pageTitle={`${departmentName}`} />
      <BrowserView>
        <SidebarLayout>
          <SidebarLayout.Sidebar>
            <div>
              <h2>{departmentName}</h2>
              <p>{numReviewSum} {reviewText}</p>
            </div>
          </SidebarLayout.Sidebar>

          <SidebarLayout.Main>
            <CourseCardRow courses={courses} showCount />
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
              hideVoting
              requireAuth={false}
              context="department"

            />
          </SidebarLayout.Main>
        </SidebarLayout>
      </BrowserView>
      <MobileView>
        <h2>{departmentName}</h2>
        <CourseCardRow courses={courses} showCount />
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
      </MobileView>
    </>
  );
}
