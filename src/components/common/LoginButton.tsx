import styles from '../../styles/components/common/LoginButton.module.scss';

type LoginButtonProps = {
   header: boolean;
}


export default function LoginButton({header=false}: LoginButtonProps) {

   const buttonClass = header ? `${styles.button} + ${styles.header}` : styles.button;

   return <button className={buttonClass}>Login</button>;
   }