import { BiLockAlt, BiQuestionMark } from "react-icons/bi";
import { BsShieldLockFill } from "react-icons/bs";
import { FiXCircle } from "react-icons/fi";
import { MdRateReview } from "react-icons/md";
import { public_course, public_instructor } from "../../lib/common/types";
import CourseCardRow from "../CourseCardRow";
import CourseRankLogo from "../CourseRankLogo";
import styles from "./RecommendationBar.module.scss";


interface RecommendationBarProps {
    id: string;
    title: string;
    description: string;
    type: string;
    displaySize?: string;
    data: public_course[];
    error: boolean;
    message: string;
    statusData: any
}



function RecommendationBar({
    id,
    title,
    description,
    type,
    displaySize,
    data,
    error,
    message,
    statusData
}: RecommendationBarProps) {

    const Fallback = () => {

        let text: string = "";
        let text2: JSX.Element = null;
        let icon: JSX.Element = null;


        if (error) {

            switch (message) {

                case "Not logged in":
                    icon = <BsShieldLockFill size={52} />;
                    text = "You must be logged in to get personalized recommendations";
                    text2 = <p>
                        <span><CourseRankLogo /></span>
                        {"requires a account to generate course recommendations"}
                    </p>;
                    break;

                case "Not student":
                    icon = <FiXCircle size={52} />;
                    text = "You must be a student to get personalized recommendations";
                    break;

                case "Banned":
                    icon = <FiXCircle size={52} />;
                    text = "You are banned from MiddCourses";
                    break;

                case "Missing semester reviews":
                    icon = <MdRateReview size={52} />;
                    text = "You must review more courses to get personalized recommendations";
                    text2 = <p>
                        <span><CourseRankLogo /></span>
                        {"requires you to have at least 2 recent reviews"}
                    </p>;
                    break;

                case "No recommendations found":
                    icon = <MdRateReview size={52} />;
                    text = "No recommendations found, try reviewing more courses";
                    text2 = <p>
                        {"You may have reviewed courses with few other reviews, try reviewing courses with more reviews "}
                    </p>;
                    break;

                case "Not enough reviews":
                    icon = <MdRateReview size={52} />;
                    text = "You must review more courses to get personalized recommendations";

                    const remainingReviews = 4 - statusData?.count ?? 0;
                    const reviewText = remainingReviews === 1 ? "review" : "reviews";
                    if (remainingReviews > 0) {
                        text2 = <p>
                            <span><CourseRankLogo /></span>
                            {`requires at least 4 reviews to generate course recommendations, you need ${remainingReviews} more ${reviewText}`}
                        </p>;
                    }
                    else {
                        text2 = <p>
                            <span><CourseRankLogo /></span>
                            {`requires at least 4 reviews to generate course recommendations`}
                        </p>;
                    }
                    break;
                default:
                    icon = <BiQuestionMark size={52} />;
                    text = "Something went wrong while generating recommendations";
                    break;
            }


        }

        else {
            icon = <MdRateReview size={52} />;
            text = "You must review more courses to get personalized recommendations";
            text2 = <p>
                <span><CourseRankLogo /></span>

                {"requires at least 4 reviews to generate course recommendations"}
            </p>;
        }



        return (
            <div className={styles.fallback}>
                {icon}
                <div className={styles.text}>
                    <p>{text}</p>
                    {text2}
                </div>
            </div >
        );

    }

    const RecsOrFallback = () => {

        if (data && data.length > 0) {
            return <CourseCardRow courses={data as public_course[]} size={displaySize} showCount={false} />
        }
        else {
            return <Fallback />
        }

    }



    return (

        <div key={id} className={styles.container}>
            {/* <h2><CourseRankLogo /></h2>*/} {/* I prefer the logo, but user tests prefer text */}
            <h2>{title}</h2>
            <p>{description}</p>
            <RecsOrFallback />

        </div>

    );

}


export default RecommendationBar;