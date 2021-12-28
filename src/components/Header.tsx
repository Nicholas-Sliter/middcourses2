
/**
 * React header component.
 * @file navigational header component.
 * @author Nicholas Sliter,
 * 
 */

import Link from "next/link";
import LoginButton from "./common/LoginButton";


import styles from "../styles/components/Header.module.scss";



export default function Header() {

   return (
     <header className={styles.header}>
       <img src='/middcourses_logo.svg' alt="middCourses" className={styles.logo} />
       <div className={styles.nav_bar}>
         <li>
           <a href="/">Home</a>
           <a href="/about">About</a>
         </li>
         <LoginButton header/>
       </div>
     </header>
   );
}