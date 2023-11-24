import { useState, useEffect } from "react";
import { cleanString } from "../lib/common/utils";

export default function useSearch(q: string, params: Record<string, string[]> = {}) {
  const query = cleanString(q);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const paramString = Object.entries(params).map(([key, values]) => {
    return values.map((value) => encodeURIComponent(value)).map((value) => `${key}=${value}`).join("&");
  }
  ).join("&");

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
        const res = await fetch(`/api/search/advanced?q=${query}&${paramString}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setLoading(false);
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
  }, [query, paramString]);

  return { results: searchResults, loading, error, q: q };
}
