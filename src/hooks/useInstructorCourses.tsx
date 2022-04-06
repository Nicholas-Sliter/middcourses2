import { useEffect, useState } from "react";
import { public_course } from "../lib/common/types";

export default function useInstructorCourses(slug: string) {

  const [courses, setCourses] = useState<public_course[]>([]);

  useEffect(() => {
    if (!slug) {
      return;
    }
    const fetchCourses = async () => {
      const res = await fetch(`/api/instructor/${slug}/courses`);

      if (!res.ok) {
        return;
      }

      const data = await res.json();
      const insertIfS = (x: string) => (x.includes("S") ? `${x}b` : x);
      const insertIfF = (x: string) => (x.includes("F") ? `${x.replace("F", "S")}c` : x);
      const insertIfW = (x: string) => (x.includes("W") ? `${x.replace("W", "S")}a` : x);

      //sort by term
      const sorted = data.courses.sort((a, b) => {
        const aTerm = insertIfW(insertIfF(insertIfS(a.term)));
        const bTerm = insertIfW(insertIfF(insertIfS(b.term)));

        return (aTerm > bTerm) ? 1 : -1;
      });

      setCourses(sorted.reverse());
    };
    fetchCourses();
  }, [slug]);

  return courses;



}