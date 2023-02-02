import { public_course, public_instructor } from "../../lib/common/types";
import CourseCardRow from "../CourseCardRow";
import styles from "./RankingBar.module.scss";

interface RankingBarProps {
    id: string;
    title: string;
    description: string;
    type: string;
    displaySize?: string;
    data: public_course[] | public_instructor[];
}



function RankingBar({
    id,
    title,
    description,
    type,
    displaySize,
    data,
}: RankingBarProps) {

    //TODO: Add support for instructor rankings


    return (

        <div key={id} className={styles.container}>
            <h2>{title}</h2>
            <p>{description}</p>

            <CourseCardRow courses={data as public_course[]} size={displaySize} showCount={false} />

        </div>




    );





}


export default RankingBar;