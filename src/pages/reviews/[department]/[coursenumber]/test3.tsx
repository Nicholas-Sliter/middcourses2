import { useEffect, useState } from "react";
import { CustomSession, public_course, public_instructor, public_review } from "../../../../lib/common/types";
import ReviewList from "../../../../components/ReviewList";
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
import Sidebar from "../../../../components/Sidebar";
import Main from "../../../../components/Main";
import { optimizedSSRCoursePage } from "../../../../lib/backend/database/course";

// SSR is amazing
export async function getServerSideProps(context) {

  const session = await getSession(context) as CustomSession;
  console.log(session)

  const departmentID = context.query.department as string;
  const courseNumber = context.query.coursenumber as string;
  const courseID = `${departmentID.toUpperCase()}${courseNumber}`;


  const data = await optimizedSSRCoursePage(courseID, session?.user?.authorized ?? false);
  const dedupedInstructors = data.instructors?.filter((instructor, index, self) => {
    return index === self.findIndex((t) => (
      t.instructorID === instructor.instructorID))
  });
  console.log(data)

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
      reviews: data.reviews,
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
}

export default function CoursePage({
  departmentID,
  departmentName,
  courseNumber,
  course,
  instructors,
  reviews,
}: CoursePageProps) {

  const [selectedInstructorIDs, setSelectedInstructorIDs] = useState<string[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<public_review[]>([]);
  const { isOpen, onClose, onOpen } = useDisclosure();

  const selectInstructor = (instructorID: string) => {
    const selected = [...new Set([...selectedInstructorIDs, instructorID])];
    setSelectedInstructorIDs(selected);
  };

  const deselectInstructor = (instructorID: string) => {
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
          <Sidebar>
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


          </Sidebar>

          <Main>
            <ReviewList
              reviews={filteredReviews}
              instructors={instructors} />
          </Main>
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
            <ReviewList reviews={filteredReviews} instructors={instructors} />
          </div>
        </div>
        <AddButton onClick={() => { onOpen() }}></AddButton>
        <AddReview isOpen={isOpen} onClose={onClose} course={course} instructors={instructors} />

      </MobileView>
    </>
  );
}
