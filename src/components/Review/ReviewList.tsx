import Review from "./ReviewCard";
import ReviewCard from "./NewReview";
import styles from "./ReviewList.module.scss";
import { CustomSession, public_instructor, public_review } from "../../lib/common/types";
import { FiXCircle } from "react-icons/fi";
import { useSession } from "next-auth/react";
import ReviewMissing from "./ReviewMissing";
import { is100LevelCourse } from "../../lib/common/utils";

interface ReviewListProps {
  reviews: public_review[];
  instructors: public_instructor[];
  expandable?: boolean;
  identifyCourse?: boolean;
  identifyInstructor?: boolean;
  hideVoting?: boolean;
  requireAuth?: boolean;
  error?: string;
  context?: "course" | "instructor" | "department" | "user";

}

export default function ReviewList({
  reviews,
  instructors,
  expandable = true,
  identifyCourse = false,
  identifyInstructor = true,
  hideVoting = false,
  requireAuth = true,
  error = "",
  context = null
}: ReviewListProps) {

  const { data: session } = useSession() as { data: CustomSession };
  const authorized = (session?.user?.authorized ?? false);

  const no_auth = requireAuth && !authorized;
  const no_reviews = error === "no_reviews" || (reviews?.length === 0 ?? true);

  const reason = (no_auth) ? "Not authorized" : (no_reviews) ? "No reviews" : error;

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
            />
          );
        })
      }
    </div>
  );
}
