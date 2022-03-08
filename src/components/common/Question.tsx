import { FormLabel } from "@chakra-ui/react";
import styles from "../../styles/components/common/Question.module.scss";

export default function Question({ children, label, htmlFor }) {
  return (
    <>
      <FormLabel className={styles.container} htmlFor={htmlFor}>
        <h5 className={styles.question}>
          {label}
        </h5>
        {children}
      </FormLabel>
    </>
  );
}
