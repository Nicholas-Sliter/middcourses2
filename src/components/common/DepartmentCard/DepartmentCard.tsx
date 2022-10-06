import { extended_department } from "../../../lib/common/types";
import DepartmentRatingBar from "../../RatingBar/DepartmentRatingBar";
import styles from "./DepartmentCard.module.scss";


interface DepartmentCardProps {
    department: extended_department;
    numReviews: number;

}

function DepartmentCard({
    department,
    numReviews
}: DepartmentCardProps) {

    console.log(department);

    const reviewText = numReviews === 1 ? "review" : "reviews";


    return (
        <div>
            <div className={styles.container}>
                <h1>{department.departmentName}</h1>
                <p>{numReviews} {reviewText}</p>
                <div style={{ height: "3rem" }}></div>
                <div>
                    <p>Average Course Reviews:</p>
                    <DepartmentRatingBar department={department} mode="course" />
                </div>
                <div>
                    <p>Average Instructor Reviews:</p>
                    <DepartmentRatingBar department={department} mode="instructor" />
                </div>
            </div>
        </div>
    )
}


export default DepartmentCard;