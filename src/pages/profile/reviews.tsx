import { getSession, useSession } from "next-auth/react";
import router from "next/router";
import { useEffect } from "react";
import ReviewList from "../../components/Review";
import { getReviewsByInstructorEmail, getReviewsByUserID } from "../../lib/backend/database/review";
import { CustomSession, public_instructor, public_review } from "../../lib/common/types";
import useIsMount from "../../hooks/useIsMount";
import AddReview from "../../components/AddReview";


export async function getServerSideProps(context) {
  const session = await getSession(context) as CustomSession
  let reviews = [] as public_review[];
  let instructors = [] as public_instructor[];

  if (!session || !session?.user?.email) {
    // If not signed in, redirect to sign in page
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    }
  }

  if (session.user.role !== "student") {
    // run instructor logic
    reviews = await getReviewsByInstructorEmail(session.user.email);
  }
  else {
    // run student logic
    reviews = await getReviewsByUserID(session.user.id);
    reviews.forEach((review) => {
      review.editable = true;
    });
    instructors = reviews.map((review) => { return { name: review.instructorName, instructorID: review.instructorID, slug: review.instructorSlug } });
  }

  return {
    props: {
      reviews: JSON.parse(JSON.stringify(reviews)),
      instructors: JSON.parse(JSON.stringify(instructors)),
      isSignedIn: true,
    }
  }


}

interface ReviewsProps {
  reviews: public_review[];
  instructors?: public_instructor[];
  isSignedIn: boolean;
}


export default function Reviews({ reviews, instructors, isSignedIn }: ReviewsProps) {

  //get session
  const { data: session } = useSession() as { data: CustomSession };
  const isInstructor = session?.user?.role === "faculty";
  const isMount = useIsMount();


  useEffect(() => {
    if (!isSignedIn && isMount) {
      router.push("/auth/signin");
    }
  }, [isSignedIn, isMount]);



  const studentTitle = "Your Reviews:";
  const instructorTitle = "Reviews of Your Courses:";


  return (
    <div style={{ padding: "1rem" }}>
      <h2>{isInstructor ? instructorTitle : studentTitle}</h2>
      <ReviewList
        reviews={reviews}
        identifyCourse
        instructors={instructors}
        identifyInstructor={!isInstructor}
        hideVoting
        hideFlag
        AddReview={AddReview}
      />
    </div>
  );

}

