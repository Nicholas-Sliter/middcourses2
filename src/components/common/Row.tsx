import styles from "../../styles/components/common/Row.module.scss";

export default function Row({children}){
  return(
    <div className={styles.container}>
      {children}
    </div>
  );
}