import styles from "../../../styles/components/common/Message.module.scss";
import { FiAlertCircle } from "react-icons/fi";

type MessageProps = {
  message: string;
};

export default function ErrorMessage({ message }: MessageProps) {
  const icon = <FiAlertCircle className={styles.icon} />;
  const messageClass = `${styles.warn} noselect`;

  const messageComponent =
    message && message !== "" ? (
      <span className={messageClass}>
        {icon}
        {message}
      </span>
    ) : null;

  return messageComponent;
}
