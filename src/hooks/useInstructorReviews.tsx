import { useEffect, useState } from "react";
import { public_review } from "../lib/common/types";

export function useInstructorReviews(slug:string){

  const [reviews, setReviews] = useState<public_review[]>([]);

  useEffect(() => {
    async function fetchReviews() {
      const res = await fetch(`/api/reviews/instructor/${slug}`);

      if (!res.ok) {
        return;
      }

      const data = await res.json();
      setReviews(data.reviews);
    }

    fetchReviews();
  }
  , [slug]);

  return reviews;
}