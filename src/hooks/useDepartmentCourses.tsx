import { useEffect, useState } from "react";

export default function useDepartmentCourses(department) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!department) {
      return;
    }
    const fetchCourses = async () => {
      const res = await fetch(
        `/api/departments/${department.toUpperCase()}/courses`
      );

      if (!res.ok) {
        return;
      }

      const data = await res.json();
      setCourses(data.courses.sort((a, b) => a.courseID.slice(4) - b.courseID.slice(4)));
    };
    fetchCourses();
  }, [department]);

  return courses;
}
