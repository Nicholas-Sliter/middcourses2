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
      <Link href="/">
        <img
          src="/middcourses_logo.svg"
          alt="middCourses"
          draggable="false"
          className={styles.logo}
        />
      </Link>
      <div className={styles.nav_bar}>
        <li>
          <Link href="/">
            <a>Home</a>
          </Link>
          <Link href="/about">
            <a>About</a>
          </Link>
        </li>
        <LoginButton header />
      </div>
    </header>
  );
}
