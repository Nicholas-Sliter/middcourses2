import styles from "./Main.module.scss";

interface MainProps {
    children: React.ReactNode;
    className?: string;
}

function Main({ children, className }: MainProps) {
    if (!children) {
        return null;
    }

    if (!className) {
        className = styles.main;
    }

    return (
        <div className={className}>
            {children}
        </div>
    )
}
export default Main;