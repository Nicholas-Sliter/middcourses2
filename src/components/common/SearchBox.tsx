import styles from "../../styles/components/common/SearchBar.module.scss";
import { useState, useEffect } from "react";
import useSearch from "../../hooks/useSearch";
import useDebounce from "../../hooks/useDebounce";
import { FiSearch } from "react-icons/fi";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
} from "@chakra-ui/react";
//import useCourseSearchResults from "../../hooks/useCourseSearchResults.js";

export default function SearchBar({ showResultDropdown = false }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const results = useSearch(debouncedQuery) as any;



  const resultDropdown = (
    <div className={styles.dropdown}>
      <Menu>
        <MenuItem>
        </MenuItem>
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
      <FiSearch className={styles.searchIcon} />
      {showResultDropdown && results.length ? resultDropdown : null}
    </div>
  );
}
