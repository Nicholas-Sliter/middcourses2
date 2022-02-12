import { useState, useEffect } from "react";
import { public_review } from "../lib/common/types";

export default function useCourseReviews(
  department: string,
  courseNumber: string
) {
  const [reviews, setReviews] = useState<public_review[]>([]);
  useEffect(() => {
    if (!department || !courseNumber) {
      return null;
    }
    async function fetchReviews() {
      const res = await fetch(
        `/api/reviews/course/${department}/${courseNumber}`
      );
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      setReviews(data.reviews);
    }

    fetchReviews();
  }, [department, courseNumber]);

  return {
    reviews: reviews,
  };
}
