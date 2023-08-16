import PageTitle from "../../../components/common/PageTitle";
import ReviewList from "../../../components/Review";
import CourseCardRow from "../../../components/CourseCardRow";
import Instructor from "../../../components/common/Instructor";
import ScrollableRow from "../../../components/common/ScrollableRow";
import { getSession } from "next-auth/react";
import { CustomSession, extended_department, public_course, public_instructor, public_review } from "../../../lib/common/types";
import { optimizedSSRDepartmentPage } from "../../../lib/backend/database/departments";
import { BrowserView, MobileView } from "../../../components/DeviceViews";
import SidebarLayout from "../../../layouts/SidebarLayout";
import DepartmentCard from "../../../components/common/DepartmentCard";
import { departmentCodeChangedMapping } from "../../../lib/common/utils";
import styles from "/src/styles/pages/Department.module.scss";

interface DepartmentPageProps {
  departmentID: string;
  departmentName: string;
  department: extended_department;
  courses: public_course[];
  instructors: public_instructor[];
  reviews: public_review[];
  authorized: boolean;
  reviewListMessage?: string;
  mobileUserAgent: boolean;
  metaDescription: string;
  canonicalURL: string;
  numReviews: number;
}

export async function getServerSideProps(context) {
  const departmentID = context.query.department as string;

  // check if dept code has changed
  if (departmentCodeChangedMapping(departmentID, "lower") !== departmentID) {
    //redirect to new dept code
    return {
      redirect: {
        destination: `/reviews/${departmentCodeChangedMapping(departmentID, "lower")}`,
        permanent: true,
      },
    };
  }

  /* redirect to padded department code if not padded (ART -> _ART) */
  if (departmentID.length < 4 && departmentID.length > 0 && !departmentID.includes("_")) {
    return {
      redirect: {
        destination: `/reviews/${departmentID.padStart(4, "_")}`,
        permanent: true,
      },
    };
  }

  const session = await getSession(context) as CustomSession;

  const signedIn = session?.user ?? false;
  const authorized = (session?.user?.authorized) ?? false;

  const data = await optimizedSSRDepartmentPage(departmentID.toUpperCase(), authorized);
  if (!data) {
    return {
      notFound: true,
    };
  }

  const departmentName = data.department.departmentName ?? null


  //use useragent to guess if mobile by presence of "mobile" in useragent
  const mobileUserAgent = context.req.headers["user-agent"].toLowerCase().includes("mobile");

  const numReviewSum = data.courses.reduce((acc, curr) => acc + parseInt(curr.numReviews as string, 10), 0);
  const reviewText = numReviewSum === 1 ? "review" : "reviews";

  const remainingReviews = numReviewSum - data.reviews.length;
  const remainingReviewsText = remainingReviews < 1 ? "" : `${remainingReviews} `;
  const remainingReviewReview = remainingReviews === 1 ? "review" : "reviews";

  let reviewListMessage = "";
  if (!data.reviews.length) {
    reviewListMessage = "";
  }
  else if (!signedIn) {
    reviewListMessage = `Login to access ${remainingReviewsText}more ${departmentName ?? "department"} ${remainingReviewReview}`;
  }
  else if (!authorized) {
    reviewListMessage = `Review at least 2 courses to access ${remainingReviewsText}more ${departmentName ?? "department"} ${remainingReviewReview}`;
  }


  const metaDescription = `Read ${numReviewSum} ${reviewText} for ${departmentName} courses at Middlebury College. Find the best ${departmentName} professors and courses.  Discover your new major today!`;

  const canonicalURL = `https://midd.courses/reviews/${departmentID.toLowerCase()}`;


  return {
    props: {
      department: {
        ...data.department,
        avgRating: data.avgRating,
        avgValue: data.avgValue,
        avgDifficulty: data.avgDifficulty,
        avgHours: data.avgHours,
        avgAgain: data.avgAgain,
        avgEffectiveness: data.avgEffectiveness,
        avgAccommodationLevel: data.avgAccommodationLevel,
        avgEnthusiasm: data.avgEnthusiasm,
        avgInstructorAgain: data.avgInstructorAgain,
        avgInstructorEnjoyed: data.avgInstructorEnjoyed,
      } as extended_department,
      departmentID: departmentID,
      departmentName: departmentName,
      courses: data.courses,
      instructors: data.instructors,
      reviews: JSON.parse(JSON.stringify(data.reviews)),
      authorized: session?.user?.authorized ?? false,
      reviewListMessage: reviewListMessage,
      mobileUserAgent: mobileUserAgent,
      metaDescription: metaDescription,
      canonicalURL: canonicalURL,
      numReviews: numReviewSum
    }
  }
}

export default function DepartmentPage({
  departmentID,
  department,
  departmentName,
  courses,
  instructors,
  reviews,
  authorized,
  reviewListMessage,
  mobileUserAgent,
  metaDescription,
  canonicalURL,
  numReviews
}: DepartmentPageProps) {

  return (
    <>
      <PageTitle
        pageTitle={`${departmentName}`}
        description={metaDescription}
        courses={courses}
        canonicalURL={canonicalURL}
      />
      <BrowserView renderDefault={!mobileUserAgent}>
        <SidebarLayout>
          <SidebarLayout.Sidebar>
            <DepartmentCard department={department} numReviews={numReviews} />
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
            {/* <h3>Recent Reviews:</h3> */}
            <ReviewList
              reviews={reviews}
              instructors={instructors}
              expandable={false}
              identifyCourse
              hideVoting
              requireAuth={false}
              context="department"
              message={reviewListMessage}

            />
          </SidebarLayout.Main>
        </SidebarLayout>
      </BrowserView>
      <MobileView renderDefault={mobileUserAgent}>
        <div className={styles.mobileContainer}>
          <div className={styles.mobileHeader}>
            <DepartmentCard department={department} numReviews={numReviews} hideInstructorAverages />
          </div>
          <CourseCardRow courses={courses} showCount />
          <div style={{ marginTop: "-1rem" }}>
            <ScrollableRow>
              {instructors.map((instructor) => (
                <Instructor instructor={instructor} key={instructor.instructorID}></Instructor>
              ))}
            </ScrollableRow>
          </div>
          <ReviewList
            reviews={reviews}
            instructors={instructors}
            expandable={false}
            identifyCourse
            hideVoting
            requireAuth={false}
            context="department"
            message={reviewListMessage}
          />
        </div>
      </MobileView>
    </>
  );
}
