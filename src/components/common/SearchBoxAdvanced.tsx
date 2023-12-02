import styles from "../../styles/components/common/SearchBar.module.scss";
import { useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import CourseSearchResult from "./SearchResult/CourseSearchResult";
import { Menu } from "@chakra-ui/react";
import { BeatLoader } from "react-spinners";
import useSearchAdvanced from "../../hooks/useSearchAdvanced";
import { public_course } from "../../lib/common/types";

interface SearchBarAdvancedProps {
  showResultDropdown?: boolean;
  filters?: Record<string, string[]>;
  onCourseSelected: (course: public_course) => void;
}

export default function SearchBarAdvanced({ showResultDropdown = false, filters, onCourseSelected }: SearchBarAdvancedProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce<string>(query, 500);

  const { results, loading, q } = useSearchAdvanced(debouncedQuery, filters);

  //if q != query, then the user is still typing, so don't show results and show loading
  const showLoading: boolean = loading || (q !== query && q.length > 3); //debounce show loading for 500ms after user stops typing
  const showResults: boolean = !loading && (q === query) && (Array.isArray(results) && results.length > 0);
  const typeMoreChars: boolean = !loading && query.length < 3 && query.length > 0;
  const noResults: boolean = !typeMoreChars && !loading && q === query && query.length > 0 && results.length === 0;

  const resultDropdown = (
    <div className={styles.dropdown}>
      {showLoading ? <div className={styles.spinner}><BeatLoader size={10} color="black" /></div> : null}
      <Menu>
        {showResults && Array.isArray(results)
          ? results.map((result) => {
            switch (result.type) {
              case "course":
                return <CourseSearchResult key={result.courseID} course={result} onClick={() => {
                  onCourseSelected(result);
                  setQuery(result.courseID);
                }} />;
              default:
                return null;
            }
          }
          )
          : null}
      </Menu>
      {(noResults) ? <div className={styles.infoText}>No results</div> : null}
      {(typeMoreChars) ? <div className={styles.infoText}>Type more characters</div> : null}
    </div>
  );

  return (
    <div className={styles.container}>
      <input
        type="text"
        draggable={false}
        placeholder="Search for courses"
        value={query}
        data-clarity-unmask="true"
        onChange={(e) => {
          setQuery(e.target.value);
        }}
      />
      {showResultDropdown && (results.length || loading || noResults || typeMoreChars) ? resultDropdown : null}
    </div>
  );
}
