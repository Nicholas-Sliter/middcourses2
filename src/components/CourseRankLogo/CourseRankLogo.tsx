import styles from "./CourseRankLogo.module.scss";


// interface CourseRankLogoProps {
//     height: number;
//     width: number;
// }


function CourseRankLogo() {


    return (
        <img
            src="/COURSERANK-logo-text.png"
            alt="COURSERANK"
            className={styles.logo}
        />
    )




}


export default CourseRankLogo;