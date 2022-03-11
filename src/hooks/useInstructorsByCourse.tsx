import {useState, useEffect} from "react";
import { public_instructor } from "../lib/common/types";
import { lastNameInstructorSort } from "../lib/frontend/utils";


export default function useInstructorsByCourse(id: string) {
  const [instructors, setInstructors] = useState<public_instructor[]>([]);

  useEffect(() => {
    async function fetchInstructors() {
      const response = await fetch(`/api/course/${id}/instructors`);
      const data = await response.json();
      setInstructors(data?.instructors.sort(lastNameInstructorSort));
    }

    if (id) {
      fetchInstructors();
    }
  }, [id]);

  return instructors;




}