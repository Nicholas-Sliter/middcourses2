import styles from "../styles/components/Footer.module.scss";
import useMobile from "../hooks/useMobile";

export default function Footer() {
  const isMobile = useMobile();

  return (
    <>
      <footer className={styles.footer}>
        <div>
          <span>
            <a style={{ display: ((isMobile) ? 'none' : 'inline-block') }}>Middlebury Course Reviews</a>
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