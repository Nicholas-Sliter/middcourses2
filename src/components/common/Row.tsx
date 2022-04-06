import styles from "../../styles/components/common/Row.module.scss";

export default function Row({children, style={}}){
  return(
    <div style={style} className={styles.container}>
      {children}
    </div>
  );
}