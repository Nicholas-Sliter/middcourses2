import { useState, useEffect } from "react";
import { cleanString } from "../lib/common/utils";

export default function useSearch(q: string) {
  const query = cleanString(q);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let controller = new AbortController();
    setLoading(true);
    setError(false);


    async function fetchResults() {
      if (query === "" || query.length < 3) {
        setLoading(false);
        setError(false);
        setSearchResults([]);
        return;
      }
      try {
        const res = await fetch(`/api/search?q=${query}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setLoading(false);
        console.log(data);
        setSearchResults(data.results);



      } catch (err) {
        setLoading(false);
        setError(true);
      }
    }

    fetchResults();

    return () => {
      controller.abort();
    };
  }, [query]);

  return { results: searchResults, loading, error, q: q };
}
