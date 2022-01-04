import styles from "../../../styles/components/common/Message.module.scss";
import { FiCheckCircle } from "react-icons/fi";

type MessageProps = {
  message: string;
};

export default function ErrorMessage({ message }: MessageProps) {
  const icon = <FiCheckCircle className={styles.icon} />;
  const messageClass = `${styles.success} noselect`;

  const messageComponent =
    message && message !== "" ? (
      <span className={messageClass}>
        {icon}
        {message}
      </span>
    ) : null;

  return messageComponent;
}
