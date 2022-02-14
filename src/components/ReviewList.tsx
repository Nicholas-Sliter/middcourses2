import Review from "./Review";
import styles from "../styles/components/ReviewList.module.scss";
import { public_instructor, public_review } from "../lib/common/types";
import {FiXCircle} from "react-icons/fi";

interface ReviewListProps {
   reviews: public_review[];
   instructors: public_instructor[];
}

export default function ReviewList({ reviews, instructors }: ReviewListProps) {
   return (
      <div className={styles.list}>
         {reviews?.length ? null : <FiXCircle className={styles.noReviewsIcon} />}
         {reviews.map(review => {
            //match instructor by instructorID
            const instructor = instructors?.find((instructor) => instructor.instructorID === review.instructorID);
            return<Review key={review.reviewID} review={review} instructor={instructor} />;}
         )}
      </div>
   );
   }