import styles from "./BannedUserNotice.module.scss";
import PageTitle from "../common/PageTitle";

function BannedUserNotice() {
    // TODO: make this pretty

    const pageUrl = typeof window !== 'undefined' ? window.location.href : "";
    console.error("Banned user tried to access site:", pageUrl);

    return (
        <>
            <PageTitle pageTitle="Banned" />
            <div className={styles.container}>
                <h1>You have been banned</h1>
                <p>This is most likely caused by writing fraudulent reviews or other abusive behavior</p>
                <p>MiddCourses is a community resource, harmful actions here impact the entire community</p>

                <p>If you believe this is a mistake, please contact us at <a href="mailto:midddev@middlebury.edu">MiddDev@middlebury.edu</a></p>
            </div >
        </>
    );




}

export default BannedUserNotice;