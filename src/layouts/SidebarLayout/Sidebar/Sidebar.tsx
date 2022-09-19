import styles from "./Sidebar.module.scss";

interface SidebarProps {
    children: React.ReactNode;
    className?: string;
}

function Sidebar({ children, className }: SidebarProps) {
    if (!children) {
        return null;
    }

    if (!className) {
        className = styles.sidebar;
    }

    return (
        <div className={className}>
            {children}
        </div>
    )
}
export default Sidebar;