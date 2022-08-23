import styles from "../styles/components/Footer.module.scss";

export default function Footer() {
  return (
    <>
      <footer className={styles.footer}>
        <span>
          <a href="/privacy-policy.html">Privacy Policy</a>
        </span>
        <img src="/MiddDev-monochrome-logo-grey.svg" alt="MiddDev Logo" className={styles.logo} />
      </footer>
    </>
  );
}