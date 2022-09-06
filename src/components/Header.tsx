/**
 * React header component.
 * @file navigational header component.
 * @author Nicholas Sliter,
 *
 */

import Link from "next/link";
import LoginButton from "./common/LoginButton";

import styles from "../styles/components/Header.module.scss";
import ProfileButton from "./common/ProfileButton";
import LoginProfileComponent from "./common/LoginProfileComponent";



//TODO: login button should render the button if the user is not logged in
// else it should render a user icon with a dropdown menu


export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" passHref>
        <img
          src="/middcourses_logo.svg"
          alt="middCourses"
          draggable="false"
          className={styles.logo}
        />
      </Link>
      {/**<div className={styles.nav_bar}>
        <li>
          <Link href="/">
            <a>Home</a>
          </Link>
          <Link href="/about">
            <a>About</a>
          </Link>
        </li>
        <LoginButton header />
  </div>*/}
      {/**<ProfileButton />*/}
      <LoginProfileComponent />
    </header>
  );
}
