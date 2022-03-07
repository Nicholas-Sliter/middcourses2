import styles from "../../styles/components/common/SearchBar.module.scss";
import { useState } from "react";
import useSearch from "../../hooks/useSearch";
import useDebounce from "../../hooks/useDebounce";
import { FiSearch } from "react-icons/fi";
import CourseSearchResult from "./CourseSearchResult";
import { Menu } from "@chakra-ui/react";
import InstructorSearchResult from "./InstructorSearchResult";
import { BeatLoader } from "react-spinners";

export default function SearchBar({ showResultDropdown = false }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { results, loading } = useSearch(debouncedQuery) as any;

  const resultDropdown = (
    <div className={styles.dropdown}>
      {loading ? <div className={styles.spinner}><BeatLoader size={10} color="black" /></div> : null}
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
        draggable={false}
        placeholder="Search..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
      />
      {showResultDropdown && (results.length || loading) ? resultDropdown : null}
    </div>
  );
}
