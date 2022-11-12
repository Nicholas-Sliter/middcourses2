import ReviewCard from "./NewReview";
import styles from "./ReviewList.module.scss";
import { CustomSession, public_instructor, public_review } from "../../lib/common/types";
import { BsThreeDots } from "react-icons/bs";
import { useSession } from "next-auth/react";
import ReviewMissing from "./ReviewMissing";

interface ReviewListProps {
  reviews: public_review[];
  instructors?: public_instructor[];
  expandable?: boolean;
  identifyCourse?: boolean;
  identifyInstructor?: boolean;
  hideVoting?: boolean;
  hideFlag?: boolean;
  requireAuth?: boolean;
  error?: string;
  context?: "course" | "instructor" | "department" | "user";
  message?: string;

}

export default function ReviewList({
  reviews,
  instructors,
  expandable = true,
  identifyCourse = false,
  identifyInstructor = true,
  hideVoting = false,
  hideFlag = false,
  requireAuth = true,
  error = "",
  context = null,
  message = null,
}: ReviewListProps) {

  const { data: session } = useSession() as { data: CustomSession };
  const loggedIn = session?.user ? true : false;
  const authorized = (session?.user?.authorized ?? false);

  const no_login = requireAuth && !loggedIn;
  const no_auth = requireAuth && !authorized && loggedIn;
  const no_reviews = error === "no_reviews" || (reviews?.length === 0 ?? true);

  const reason = (no_login) ? "No login" : (no_auth) ? "Not authorized" : (no_reviews) ? "No reviews" : error;

  if (!instructors) {
    instructors = [];
    identifyInstructor = false;
  }

  const FallbackComponent = () => {
    return <ReviewMissing
      reason={reason}
      context={context}
    />
  };

  return (
    <div className={styles.list}>
      {(!reviews.length && (no_auth || no_reviews)) ? <FallbackComponent /> :

        reviews.map((review) => {
          //match instructor by instructorID
          const instructor = instructors?.find(
            (instructor) => instructor.instructorID === review.instructorID
          )
          return (
            <ReviewCard
              key={review.reviewID}
              review={review}
              instructor={instructor}
              expandable={expandable}
              identifyCourse={identifyCourse}
              identifyInstructor={identifyInstructor}
              hideVoting={hideVoting}
              hideFlag={hideFlag}
            />
          );
        })
      }
      {(message) ?
        <div className={styles.message}>
          <BsThreeDots />
          {message}
        </div>
        : null}
    </div>
  );
}
