import RecommendationQuickLink from "./RecommendationQuickLink";
import ScheduleQuickLink from "./ScheduleQuickLink";
import styles from "./QuickLinkBar.module.scss";
import AdvancedSearchQuickLink from "./AdvancedSearchQuickLink";

function QuickLinkBar() {


    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <RecommendationQuickLink />
                {/* <AdvancedSearchQuickLink /> */}
                <ScheduleQuickLink />
            </div>
        </div>
    );


}


export default QuickLinkBar;