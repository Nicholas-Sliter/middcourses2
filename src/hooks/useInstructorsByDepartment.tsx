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
        setInstructors(data.instructors);
      };
      fetchInstructors();
    }
    , [department]);
  
    return instructors;

  }