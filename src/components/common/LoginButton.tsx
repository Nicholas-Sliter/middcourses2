import { signIn } from "next-auth/react";
import styles from "../../styles/components/common/LoginButton.module.scss";

interface LoginButtonProps {
  header?: boolean;
}

export default function LoginButton({ header = false }: LoginButtonProps) {
  
  const buttonClass = header
    ? `${styles.button} + ${styles.header}`
    : styles.button;
  const pid = "google"; //only using Google provider id for now

  return (
    <button className={buttonClass} onClick={() => signIn(pid)}>
      Login
    </button>
  );
}
