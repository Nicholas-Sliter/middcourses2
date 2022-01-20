import styles from "../../styles/components/common/Group.module.scss";

type FlexGroupProps = {
  children: React.ReactNode;
  center?: boolean;
};

export default function FlexGroup({ children, center = false }: FlexGroupProps) {
  const className: string = `${styles.flexGroup} ${center ? styles.center : ""}`;
  return <div className={className}>{children}</div>;
}
