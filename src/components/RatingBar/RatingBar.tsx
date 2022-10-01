import RatingBox from "../RatingBox";
import styles from "./RatingBar.module.scss";

function RatingBar({ children, vertical = false, hide = false }) {
    const containerClasses = [styles.container];
    if (vertical) {
        containerClasses.push(styles.vertical);
    }
    if (hide) {
        containerClasses.push(styles.hide);
    }
    const containerClassName = containerClasses.join(" ");


    return (
        <div className={containerClassName}>
            {children}
        </div>
    )


}

export default RatingBar;