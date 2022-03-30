import {useState, useEffect} from "react";
import { public_instructor } from "../lib/common/types";
import { lastNameInstructorSort } from "../lib/frontend/utils";


export default function useInstructorsByCourse(id: string) {
  const [instructors, setInstructors] = useState<public_instructor[]>([]);

  useEffect(() => {
    async function fetchInstructors() {
      const response = await fetch(`/api/course/${id}/instructors`);
      const data = await response.json();
      
      //dedupe instructors
      const deduped = data?.instructors?.filter((instructor, index, self) =>
        index === self.findIndex((t) => (
          t.instructorID === instructor.instructorID
        ))
      );
      setInstructors(deduped?.sort(lastNameInstructorSort));
    }

    if (id) {
      fetchInstructors();
    }
  }, [id]);

  return instructors;




}