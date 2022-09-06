import Link from "next/link";
import styles from "../styles/components/Header.module.scss";
import LoginProfileComponent from "./common/LoginProfileComponent";


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
      <LoginProfileComponent />
    </header>
  );
}
