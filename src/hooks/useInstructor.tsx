import { useState, useEffect } from "react";
import { public_instructor } from "../lib/common/types";


export default function useInstructor(id:string) {
   const [instructor, setInstructor] = useState<public_instructor>(null);
   useEffect(() => {
      async function fetchInstructor() {
         const res = await fetch(`/api/instructor/${id}`);
         if (!res.ok) {
            return null;
         }
         const data = await res.json();
         setInstructor(data.instructor);
      }

      fetchInstructor();
   }, [id]);

  return instructor;
}