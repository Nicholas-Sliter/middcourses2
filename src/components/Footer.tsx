import styles from "../styles/components/Footer.module.scss";

export default function Footer() {
  return (
    <>
      <footer className={styles.footer}>
        <div>
          <span>
            <a>Middlebury Course Reviews</a>
            <a href="/privacy-policy.html">Privacy Policy</a>
          </span>
        </div>
        <div className={styles.logoContainer}>
          <img src="/MiddDev-monochrome-logo-grey.svg" alt="MiddDev Logo" className={styles.logo} />
        </div>
      </footer>
    </>
  );
}