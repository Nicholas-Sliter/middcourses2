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
      //order by reviewDate with the most recent review first
      const sorted = data.sort((a, b) => {
        return (a.reviewDate > b.reviewDate) ? -1 : 1;
      });
      setRecentReviews(sorted);
    };
    fetchRecentReviews();
  }, [department]);

  return recentReviews;



}
