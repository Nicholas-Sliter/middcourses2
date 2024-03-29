import { useCallback, useEffect, useState } from "react";
import { CustomSession, public_course, public_instructor, public_review } from "../../../../lib/common/types";
import ReviewList from "../../../../components/Review";
import CourseCard from "../../../../components/CourseCard";
import BarChart from "../../../../components/BarChart";
//import InstructorBar from "../../../../components/InstructorBar";
import InstructorBar from "../../../../components/InstructorBar";
import AddButton from "../../../../components/common/AddButton";
import AddReview from "../../../../components/AddReview";
import { useDisclosure } from "@chakra-ui/react";
import PageTitle from "../../../../components/common/PageTitle";
import { getSession, useSession } from "next-auth/react";
import { BrowserView, MobileView } from "../../../../components/DeviceViews";
import { TbArrowBackUp } from 'react-icons/tb';
import Link from "next/link";
import SidebarLayout from "../../../../layouts/SidebarLayout";
import { optimizedSSRCoursePage } from "../../../../lib/backend/database/course";
//import RatingBox from "../../../../components/RatingBox";
import { useToast } from "@chakra-ui/react";
import { departmentCodeChangedMapping, is100LevelCourse, isFYSECourse } from "../../../../lib/common/utils";

// SSR is amazing
export async function getServerSideProps(context) {

  const session = await getSession(context) as CustomSession;

  const departmentID = context.query.department as string;
  const courseNumber = context.query.coursenumber as string;
  if (courseNumber.length < 4) { /* try and fix course number by 0-padding */
    const paddedCourseNumber = courseNumber.padStart(4, "0");
    return {
      redirect: {
        destination: `/reviews/${departmentID}/${paddedCourseNumber}`,
        permanent: true,
      },
    };
  }
  const courseID = `${departmentID.toUpperCase()}${courseNumber}`;

  const mobileUserAgent = context.req.headers["user-agent"].toLowerCase().includes("mobile");

  // check if dept. code has changed
  if (departmentCodeChangedMapping(departmentID, "lower") !== departmentID) {
    //check if redirect course exists, if not, skip redirect
    return {
      redirect: {
        destination: `/reviews/${departmentCodeChangedMapping(departmentID, "lower")}/${courseNumber}`,
        permanent: true,
      },
    };

  }


  const data = await optimizedSSRCoursePage(courseID, session);
  if (!data) {
    return {
      notFound: true,
    };
  }
  const dedupedInstructors = data.instructors?.filter((instructor, index, self) => {
    return index === self.findIndex((t) => (
      t.instructorID === instructor.instructorID))
  });


  const signedIn = session?.user ?? false;
  const authorized = session?.user?.authorized ?? false;

  const ratingDescription = (data.numReviews) ? `This course has an overall rating of ${parseFloat(data?.avgRating?.toFixed(1)) ?? null} out of 10 based on ${data.numReviews} reviews.` : "This course has not been reviewed yet.";
  const metaDescription = `${data.courseName} is a ${courseNumber}-level course offered in the ${data.departmentName} department at Middlebury College. ${ratingDescription}`;

  const canonicalURL = `https://midd.courses/reviews/${departmentID.toLowerCase()}/${courseNumber}`;


  return {
    props: {
      departmentID: departmentID,
      departmentName: data.departmentName,
      courseNumber: courseNumber,
      course: {
        courseID: data.courseID,
        courseName: data.courseName,
        courseDescription: data.courseDescription,
        avgRating: data.avgRating,
        avgDifficulty: data.avgDifficulty,
        avgHours: data.avgHours,
        avgValue: data.avgValue,
        avgAgain: data.avgAgain,
        topTags: data.topTags,
        numReviews: data.numReviews,
        aliases: data.aliases,
      },
      instructors: dedupedInstructors,
      reviews: JSON.parse(JSON.stringify(data.reviews)),
      authorized: authorized,
      alreadyReviewed: data.hasReviewedCourseBefore,
      signedIn: signedIn,
      mobileUserAgent: mobileUserAgent,
      metaDescription: metaDescription,
      canonicalURL: canonicalURL,
      bookmarked: data.bookmarked
    }
  }
}


interface CoursePageProps {
  departmentID: string;
  departmentName: string;
  courseNumber: string;
  course: public_course;
  instructors: public_instructor[];
  reviews: public_review[];
  authorized: boolean;
  signedIn: boolean;
  mobileUserAgent: boolean;
  metaDescription: string;
  canonicalURL: string;
  bookmarked: boolean;
  alreadyReviewed: boolean;
}

export default function CoursePage({
  departmentID,
  departmentName,
  courseNumber,
  course,
  instructors,
  reviews,
  authorized,
  signedIn,
  mobileUserAgent,
  metaDescription,
  canonicalURL,
  bookmarked,
  alreadyReviewed
}: CoursePageProps) {

  const [selectedInstructorIDs, setSelectedInstructorIDs] = useState<string[]>(Array.from(new Set(instructors.map(instructor => instructor.instructorID))));
  const [filteredReviews, setFilteredReviews] = useState<public_review[]>(reviews);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(bookmarked); /* Need local state for update without reload */
  const { isOpen, onClose, onOpen } = useDisclosure();

  const shouldHideAddReviewButton = alreadyReviewed;
  const shouldHideAddReviewButtonTooltip = shouldHideAddReviewButton ? "You have already reviewed this course" : null;

  const toast = useToast();

  const showBookmark = signedIn;

  course.departmentName = departmentName;


  const bookmarkToast = (data: {
    error: boolean,
    message: string,
    bookmarkAdded: boolean,
    bookmarkRemoved: boolean
  }) => {

    toast({
      title: data.message,
      status: data.error ? 'error' : 'success',
      duration: 5000,
      isClosable: true,
    })

  };

  const setIsBookmarkedWrapper = (data: {
    error: boolean,
    message: string,
    bookmarkAdded: boolean,
    bookmarkRemoved: boolean
  }) => {

    if (data.bookmarkAdded) {
      setIsBookmarked(true);
    }

    if (data.bookmarkRemoved) {
      setIsBookmarked(false);
    }

    bookmarkToast(data);
  };


  const filterInstructorToast = () => {
    if (toast.isActive('filterInstructorToast')) {
      return;
    }
    toast({
      title: 'Review 2 courses to unlock instructor filtering',
      description: "You must be a registered user with 2 or more reviews in the last 6 months to filter by instructor.",
      status: 'error',
      duration: 5000,
      isClosable: true,
      id: 'filterInstructorToast'

    })
  };

  const signInToast = (id: string) => {
    if (signedIn || authorized) {
      return;
    }
    // two toasts, one for 100-level courses, one all others
    if (is100LevelCourse(course.courseID)) {
      toast({
        title: 'You can access 100-level course reviews without signing in. Sign in to access reviews for other courses.',
        status: 'info',
        duration: 10000,
        isClosable: true,
        id: id
      })
    } else if (isFYSECourse(course.courseID)) {
      toast({
        title: 'You can access FYSE course reviews without signing in. Sign in to access reviews for other courses.',
        status: 'info',
        duration: 10000,
        isClosable: true,
        id: id
      })

    }
    else {
      toast({
        title: 'Sign in to access reviews for this course.',
        status: 'info',
        duration: 10000,
        isClosable: true,
        id: id
      })
    }
  };

  const selectInstructor = (instructorID: string) => {
    if (!authorized) {
      filterInstructorToast();
      return;
    }

    const selected = [...new Set([...selectedInstructorIDs, instructorID])];
    setSelectedInstructorIDs(selected);
  };

  const deselectInstructor = (instructorID: string) => {
    if (!authorized) {
      filterInstructorToast();
      return;
    }
    const selected = selectedInstructorIDs.filter((id) => id !== instructorID);
    setSelectedInstructorIDs(selected);
  };

  const doubleClickInstructor = (instructorID: string) => {

    if (!authorized) {
      filterInstructorToast();
      return;
    }

    if (selectedInstructorIDs.includes(instructorID) && selectedInstructorIDs.length > 1) {
      setSelectedInstructorIDs([instructorID]);
      return;
    }

    if (!selectedInstructorIDs.includes(instructorID)) {
      setSelectedInstructorIDs([instructorID]);
      return;
    }

    if (selectedInstructorIDs.includes(instructorID) && selectedInstructorIDs.length === 1) {
      setSelectedInstructorIDs(instructors.map(instructor => instructor.instructorID));
      return;
    }

  };

  const memoDoubleClickInstructor = useCallback(doubleClickInstructor, [selectedInstructorIDs, instructors]);


  /* Close toasts on initial pageload */
  useEffect(() => {
    toast.closeAll();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //filter reviews by selected instructors
  useEffect(() => {
    const filtered = reviews.filter((review) =>
      selectedInstructorIDs.includes(review.instructorID)
    );
    setFilteredReviews(filtered);
  }, [
    selectedInstructorIDs,
    reviews,
    reviews.length,
    departmentID,
    courseNumber,
  ]);

  // run sign in toast 500ms after page load
  useEffect(() => {
    setTimeout(() => {
      const id = "courseLoginPrompt"
      if (!toast.isActive(id))
        signInToast(id);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <>
      <PageTitle
        pageTitle={`${course?.courseName}`}
        description={metaDescription}
        courses={[course]}
        canonicalURL={canonicalURL}
      />
      <BrowserView renderDefault={!mobileUserAgent}>
        <SidebarLayout>
          <SidebarLayout.Sidebar>
            <div>
              <CourseCard
                course={course}
                style={{ borderBottom: "none" }}
                showBookmark={showBookmark}
                isBookmarked={isBookmarked}
                setBookmarked={setIsBookmarkedWrapper}
              />
              <InstructorBar
                instructors={instructors}
                selected={selectedInstructorIDs}
                select={selectInstructor}
                deselect={deselectInstructor}
                onDoubleClick={memoDoubleClickInstructor}
                useTags
              />
            </div>
            <Link
              href={`/reviews/${departmentID}`}
              passHref
            >
              <a style={{ color: "#333", marginRight: 'auto', marginLeft: 'auto' }}><TbArrowBackUp /> {departmentName} courses</a>
            </Link>


          </SidebarLayout.Sidebar>

          <SidebarLayout.Main>
            <ReviewList
              reviews={filteredReviews}
              instructors={instructors}
              context="course"
              requireAuth={!is100LevelCourse(course.courseID)} />
          </SidebarLayout.Main>
        </SidebarLayout>
        <AddButton onClick={() => { onOpen() }} disabled={shouldHideAddReviewButton} disabledTooltip={shouldHideAddReviewButtonTooltip}></AddButton>
        <AddReview isOpen={isOpen} onClose={onClose} course={course} instructors={instructors} />
      </BrowserView>

      <MobileView renderDefault={mobileUserAgent}>
        <div>
          <CourseCard
            course={course}
            showBookmark={showBookmark}
            isBookmarked={isBookmarked}
            setBookmarked={setIsBookmarkedWrapper}
          />
          <InstructorBar
            instructors={instructors}
            selected={selectedInstructorIDs}
            select={selectInstructor}
            deselect={deselectInstructor}
          // onDoubleClick={memoDoubleClickInstructor} /* Most mobile browsers don't support double click */
          />
          <div>
            <ReviewList
              reviews={filteredReviews}
              instructors={instructors}
              context="course"
              requireAuth={!is100LevelCourse(course.courseID)} />
          </div>
        </div>
        <AddButton onClick={() => { onOpen() }} disabled={shouldHideAddReviewButton} disabledTooltip={shouldHideAddReviewButtonTooltip}></AddButton>
        <AddReview isOpen={isOpen} onClose={onClose} course={course} instructors={instructors} />

      </MobileView>
    </>
  );
}
