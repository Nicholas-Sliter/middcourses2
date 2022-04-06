import { useState, useEffect } from "react";
import { public_instructor } from "../lib/common/types";


export default function useInstructorBySlug(slug:string) {
   const [instructor, setInstructor] = useState<public_instructor>(null);

   useEffect(() => {

      if (!slug) {
         return;
      }

      async function fetchInstructor() {
         const res = await fetch(`/api/instructor/${slug}`);
         if (!res.ok) {
            return null;
         }
         const data = await res.json();
         setInstructor(data.instructor);
      }

      fetchInstructor();
   }, [slug]);

  return instructor;
}