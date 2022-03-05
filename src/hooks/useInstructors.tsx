import {useState, useEffect} from 'react';
import { public_instructor } from '../lib/common/types';
import { lastNameInstructorSort } from '../lib/frontend/utils';

export default function useInstructors(instructorIDs: string[]){
  const [instructors, setInstructors] = useState<public_instructor[]>([]);

  //get instructors
  useEffect(() => {
    async function fetchInstructors() {
      const ids = [...new Set(instructorIDs)];
      //this set actually doesn't do anything since the instructors are objects
      const arr: public_instructor[] = [];
      instructorIDs.forEach(async (id) => {
        const res = await fetch(`/api/instructor/id/${id}`);
        if (!res.ok) {
          return;
        }
        const instructor = (await res.json())?.instructor as public_instructor;
        arr.push(instructor);
        arr.sort(lastNameInstructorSort);
        setInstructors([...arr]);
      });
    }
    fetchInstructors();
  }, [instructorIDs]);

return instructors;

}

