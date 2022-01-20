import styles from "../../styles/components/common/Group.module.scss";

type GroupProps = {
  children: React.ReactNode;
  center?: boolean;
};

export default function Group({ children, center = false }: GroupProps) {
  const className: string = `${styles.group} ${center ? styles.center : ""}`;
  return <div className={className}>{children}</div>;
}
