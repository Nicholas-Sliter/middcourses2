import styles from "../../../styles/components/common/Message.module.scss";
import { FiInfo } from "react-icons/fi";

type MessageProps = {
  message: string;
};

export default function ErrorMessage({ message }: MessageProps) {
  const icon = <FiInfo className={styles.icon} />;
  const messageClass = `${styles.info} noselect`;

  const messageComponent =
    message && message !== "" ? (
      <span className={messageClass}>
        {icon}
        {message}
      </span>
    ) : null;

  return messageComponent;
}
