import styles from "../../styles/components/common/SearchBar.module.scss";
import { useState } from "react";
import useSearch from "../../hooks/useSearch";
import useDebounce from "../../hooks/useDebounce";
import CourseSearchResult from "./SearchResult/CourseSearchResult";
import { Menu } from "@chakra-ui/react";
import InstructorSearchResult from "./SearchResult/InstructorSearchResult";
import { BeatLoader } from "react-spinners";
import { DepartmentSearchResult } from "./SearchResult";

export default function SearchBar({ showResultDropdown = false }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce<string>(query, 500);

  const { results, loading, q } = useSearch(debouncedQuery) as any;

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
                return <CourseSearchResult key={result.courseID} course={result} />;
              case "instructor":
                return <InstructorSearchResult key={result.slug} instructor={result} />;
              case "department":
                return <DepartmentSearchResult key={result.departmentID} department={result} />;
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
        placeholder="Search for courses or instructors"
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
