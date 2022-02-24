import {useState, useEffect } from "react";
import { cleanString } from "../lib/common/utils";

export default function useSearch(q: string) {
  const query = cleanString(q);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setResults([]);
    
    async function fetchResults() {
      try {
        const res = await fetch(`/api/search?q=${query}`);
        const data = await res.json();
        setLoading(false);
        setResults(data);
      } catch (err) {
        setLoading(false);
        setError(true);
      }
    }

    fetchResults();
    
  }, [query]);

  return { results, loading, error };

}