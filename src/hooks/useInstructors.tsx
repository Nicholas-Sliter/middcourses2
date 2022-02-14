import {useState, useEffect} from 'react';
import { public_instructor } from '../lib/common/types';
import { lastNameInstructorSort } from '../lib/frontend/utils';
/**
 * Resolve instructors from a list of instructor ids
 * @param instructorIDs 
 */
export default function useInstructors(instructorIDs: string[]) {
   console.log("useInstructors: ", instructorIDs);
   const [instructors, setInstructors] = useState<Set<public_instructor>>(new Set());
  
   useEffect(() => {
      if (!instructorIDs.length) {
         return;
      }

       const currSet: Set<public_instructor> = new Set();

      const fetchInstructor = async (id:string) => {
         const res = await fetch(`/api/instructor/id/${id}`);
         const instructor = await res.json();
         currSet.add(instructor);
      }

      instructorIDs.forEach((id) => {
         fetchInstructor(id);
      });

      setInstructors(currSet);

   }, [instructorIDs]);

   console.log("useInstructors finished with: ", [...instructors]);
   return [...instructors];

}