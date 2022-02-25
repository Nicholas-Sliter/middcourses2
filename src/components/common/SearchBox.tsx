import styles from "../../styles/components/common/SearchBar.module.scss";
import { useState, useEffect } from "react";
import useSearch from "../../hooks/useSearch";
import useDebounce from "../../hooks/useDebounce";
import { FiSearch } from "react-icons/fi";
import CourseSearchResult from "./CourseSearchResult";
import { Menu, MenuButton, MenuList } from "@chakra-ui/react";
import InstructorSearchResult from "./InstructorSearchResult";
//import useCourseSearchResults from "../../hooks/useCourseSearchResults.js";

export default function SearchBar({ showResultDropdown = false }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { results } = useSearch(debouncedQuery) as any;

  const resultDropdown = (
    <div className={styles.dropdown}>
      <Menu>
          {Array.isArray(results)
            ? results.map((result) =>
                result?.courseID ? (
                  <CourseSearchResult course={result} key={result.courseID} />
                ) : (
                  <InstructorSearchResult
                    instructor={result}
                    key={result.instructorId}
                  />
                )
              )
            : null}
      </Menu>
    </div>
  );

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
      />
      {showResultDropdown && results.length ? resultDropdown : null}
    </div>
  );
}

// <FiSearch className={styles.searchIcon} />
