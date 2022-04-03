import { useEffect, useState } from "react";

export default function useDepartment(departmentCode: string){

  const [department, setDepartment] = useState<string>();

  useEffect(() => {
    if (!departmentCode) {
      return;
    }
    const fetchDepartment = async () => {
      const res = await fetch(`/api/departments/${departmentCode?.toUpperCase()}`);
      
      if (!res.ok) {
        return;
      }

      const data = await res.json();
      setDepartment(data.name);
    };
    fetchDepartment();
  }, [departmentCode]);

  return department ?? "";

}