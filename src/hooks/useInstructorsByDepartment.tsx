import { useEffect, useState } from "react";


export default function useInstructorsByDepartment(department){
  
    const [instructors, setInstructors] = useState([]);
  
    useEffect(() => {
      if (!department) {
        return;
      }
      const fetchInstructors = async () => {
        const res = await fetch(`/api/departments/${department.toUpperCase()}/instructors`);
        
        if (!res.ok) {
          return;
        }
  
        const data = await res.json();
        const i = data.instructors.sort((a,b) => {
          const a_last = a.name.split(" ")[a.name.split(" ").length - 1];
          const b_last = b.name.split(" ")[b.name.split(" ").length - 1];

          return a_last > b_last ? 1 : -1;

        });
        setInstructors(i);
      };
      fetchInstructors();
    }
    , [department]);
  
    return instructors;

  }