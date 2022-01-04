import styles from "../../../styles/components/common/Message.module.scss";
import { FiXCircle } from "react-icons/fi";


type MessageProps = {
    message: string;
};

export default function ErrorMessage({ message }: MessageProps) {

  const icon = <FiXCircle className={styles.icon} />;
  const messageClass = `${styles.error} noselect`;

  const messageComponent =
    message && message !== "" ? (
      <span className={messageClass}>
        {icon}
        {message}
      </span>
    ) : null;

  return messageComponent;
}
