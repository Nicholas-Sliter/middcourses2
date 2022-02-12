import Group from "./common/Group";
import styles from "../styles/components/Review.module.scss";

export default function Review({ review }) {
  return(
  <div className={styles.container}>
  <Group>
      <p>{review.rating}</p>
  </Group>
  </div>);
}
