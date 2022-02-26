import { useState, useEffect } from "react";
import { cleanString } from "../lib/common/utils";
import { orderSearchResults } from "../lib/frontend/utils";

export default function useSearch(q: string) {
  const query = cleanString(q);
  //const [results, setResults] = useState<any>({});

  const [orderedCourseResults, setOrderedCourseResults] = useState<any[]>([]);
  const [orderedInstructorResults, setOrderedInstructorResults] = useState<
    any[]
  >([]);



  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    //setResults([]);

    async function fetchResults() {
      if (query === "") {
        //setResults([]);
        setLoading(false);
        setError(false);
        return;
      }
      try {
        const res = await fetch(`/api/search?q=${query}`);
        const data = await res.json();
        setLoading(false);
        //setResults(data);

        const courseResults = data.courses;
        const instructorResults = data.instructors;
        
        setOrderedCourseResults(orderSearchResults(courseResults, "course", query));
        setOrderedInstructorResults(orderSearchResults(instructorResults, "instructor", query));

      } catch (err) {
        setLoading(false);
        setError(true);
      }
    }

    fetchResults();
  }, [query]);


  //merge the two sorted arrays together based on the score property
  //const orderedResults = [...orderedCourseResults, ...orderedInstructorResults].sort((a, b) => {a-b});

  const orderedResults = [
    ...orderedCourseResults,
    ...orderedInstructorResults,
  ].sort((a, b) => {
    return a.score - b.score;
  });
  
  const results = orderedResults.map((result) => result.item);

  return { results, loading, error };
}
