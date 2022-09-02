import styles from "./SidebarLayout.module.scss";

function SidebarLayout({ children }: { children: React.ReactNode }) {


    return (
        <div className={styles.sidebarLayout}>
            {children}
        </div>
    )



}

export default SidebarLayout;