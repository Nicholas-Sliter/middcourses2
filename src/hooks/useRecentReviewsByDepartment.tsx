import { useEffect, useState } from "react";

export default function useRecentReviewsByDepartment(department){

  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    if (!department) {
      return;
    }
    const fetchRecentReviews = async () => {
      const res = await fetch(`/api/reviews/department/${department.toUpperCase()}`);
      
      if (!res.ok) {
        return;
      }

      const data = await res.json();
      setRecentReviews(data);
    };
    fetchRecentReviews();
  }, [department]);

  console.log(recentReviews);

  return recentReviews;



}
