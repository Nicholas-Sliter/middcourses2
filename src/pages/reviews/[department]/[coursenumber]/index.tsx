import { useEffect, useState } from "react";
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
import { getSession } from "next-auth/react";
import { BrowserView, MobileView } from "../../../../components/DeviceViews";
import { TbArrowBackUp } from 'react-icons/tb';
import Link from "next/link";
import SidebarLayout from "../../../../layouts/SidebarLayout";
import { optimizedSSRCoursePage } from "../../../../lib/backend/database/course";
//import RatingBox from "../../../../components/RatingBox";
import { useToast } from "@chakra-ui/react";
import RatingBox from "../../../../components/RatingBox";
import RatingBar from "../../../../components/RatingBar";

// SSR is amazing
export async function getServerSideProps(context) {

  const session = await getSession(context) as CustomSession;

  const departmentID = context.query.department as string;
  const courseNumber = context.query.coursenumber as string;
  const courseID = `${departmentID.toUpperCase()}${courseNumber}`;


  const data = await optimizedSSRCoursePage(courseID, session);
  const dedupedInstructors = data.instructors?.filter((instructor, index, self) => {
    return index === self.findIndex((t) => (
      t.instructorID === instructor.instructorID))
  });

  return {
    props: {
      departmentID: departmentID,
      departmentName: data.departmentName,
      courseNumber: courseNumber,
      course: {
        courseID: data.courseID,
        courseName: data.courseName,
        courseDescription: data.courseDescription,
      },
      instructors: dedupedInstructors,
      reviews: JSON.parse(JSON.stringify(data.reviews)),
      authorized: session?.user?.authorized ?? false,
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
}

export default function CoursePage({
  departmentID,
  departmentName,
  courseNumber,
  course,
  instructors,
  reviews,
  authorized,
}: CoursePageProps) {

  const [selectedInstructorIDs, setSelectedInstructorIDs] = useState<string[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<public_review[]>([]);
  const { isOpen, onClose, onOpen } = useDisclosure();

  const toast = useToast();

  const filterInstructorToast = () => {
    toast({
      title: 'Review 2 courses to unlock instructor filtering',
      description: "You must be a registered user with 2 or more reviews in the last 6 months to filter by instructor.",
      status: 'error',
      duration: 5000,
      isClosable: true,

    })
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

  //on load of instructors, select all instructor ids
  useEffect(() => {
    setSelectedInstructorIDs(instructors.map((instructor) => instructor.instructorID));
  }, [instructors, instructors.length, courseNumber, departmentID]);


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

  return (
    <>
      <PageTitle pageTitle={`${course?.courseName}`} />
      <BrowserView>
        <SidebarLayout>
          <SidebarLayout.Sidebar>
            <div>
              <CourseCard course={course} />
              <InstructorBar
                instructors={instructors}
                selected={selectedInstructorIDs}
                select={selectInstructor}
                deselect={deselectInstructor}
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
              context="course" />
          </SidebarLayout.Main>
        </SidebarLayout>
        <AddButton onClick={() => { onOpen() }}></AddButton>
        <AddReview isOpen={isOpen} onClose={onClose} course={course} instructors={instructors} />
      </BrowserView>

      <MobileView>
        <div>
          <CourseCard course={course} />
          <hr />
          <InstructorBar
            instructors={instructors}
            selected={selectedInstructorIDs}
            select={selectInstructor}
            deselect={deselectInstructor}
          />
          <div>
            <ReviewList reviews={filteredReviews} instructors={instructors} context="course" />
          </div>
        </div>
        <AddButton onClick={() => { onOpen() }}></AddButton>
        <AddReview isOpen={isOpen} onClose={onClose} course={course} instructors={instructors} />

      </MobileView>
    </>
  );
}
