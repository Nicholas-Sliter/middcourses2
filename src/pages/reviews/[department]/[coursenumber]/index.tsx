import { NextRouter, useRouter } from "next/router";
import { useEffect, useState } from "react";
import useCourse from "../../../../hooks/useCourse";
import useCourseReviews from "../../../../hooks/useCourseReviews";
import { public_review } from "../../../../lib/common/types";

export default function CoursePage() {
  const router: NextRouter = useRouter();
  const { department, courseNumber, semester, instructor }: any = router.query;

  const course = useCourse(department, courseNumber);

  const reviews = useCourseReviews(department, courseNumber)?.reviews as
    | public_review[]
    | null;

  useEffect(() => {
    if (!reviews?.length) {
      return null;
    }
    const instructorIDs = [
      ...new Set(reviews.map((review) => review.instructorID)),
    ];
    const instructors = instructorIDs.map(async (id) => {
      const res = await fetch(`/api/instructor/id/${id}`);
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      return data.instructor;
    });
  }, [reviews]);

  return (
    <div>
      {course ? (
        <>
          <h1>{course?.courseName}</h1>
          <span>{`${course?.courseID.substring(0, 4)}`}</span>
          <span> </span>
          <span>{`${course?.courseID.substring(4)}`}</span>
          <p>{course?.courseDescription}</p>{" "}
        </>
      ) : null}
      <hr />
      <div>
        <h2>Reviews</h2>
        {reviews?.map((review) => (
          <div key={review.reviewID}>
            <span>{review.rating}</span>
            <br />
            <p>{review.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
