import styles from "./SidebarLayout.module.scss";
import Sidebar from "./Sidebar";
import Main from "./Main";

function SidebarLayout({ children }: { children: React.ReactNode }) {


    return (
        <div className={styles.sidebarLayout}>
            {children}
        </div>
    )



}

SidebarLayout.Sidebar = Sidebar;
SidebarLayout.Main = Main;

export default SidebarLayout;