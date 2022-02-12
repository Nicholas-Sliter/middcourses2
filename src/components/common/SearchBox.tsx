import styles from "../../styles/components/common/SearchBar.module.scss";
import { useState, useEffect } from "react";
import useCourseSearchResults from "../../hooks/useCourseSearchResults.js";

export default function SearchBar({showResultDropdown=false}){
   const [value, setValue] = useState("");



   const resultDropdown = (
      <div className={styles.dropdown}>
      </div>
   );



   return(
      <div className={styles.container}>
         <input type="text" placeholder="Search..." value={value} onChange={(e) => {setValue(e.target.value)}}/>
         {showResultDropdown && value.length ? <div className={styles.resultDropdown} /> : null}
      </div>
   );
}