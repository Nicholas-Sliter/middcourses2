import { useState, useEffect } from "react";
import { public_course } from "../lib/common/types";

export default function useCourse(
  department: string,
  courseNumber: string
) {
  const [course, setCourse] = useState<public_course>(null);

  useEffect(() => {
    if (!department || !courseNumber) {
      return null;
    }

    const controller = new AbortController();

    async function fetchCourse() {
      const id = `${department?.toUpperCase()}${courseNumber}`;
      const res = await fetch(`/api/course/${id}`, {
        signal: controller.signal
      });
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      setCourse(data.course);
    }

    fetchCourse();

    return () => {
      controller.abort();
    };

  }, [department, courseNumber]);

  return course;
}
