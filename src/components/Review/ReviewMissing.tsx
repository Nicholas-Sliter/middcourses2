import { FiXCircle } from "react-icons/fi";
import styles from "./ReviewMissing.module.scss";

interface ReviewMissingProps {
    reason: "No reviews" | "Not authorized" | string;
    context: "course" | "instructor" | "department" | "user";
    numberToDisplay?: number;
}

/** Display this component when there are no reviews or a user is not authroized to view them
 * @param reason The reason why the user cannot view the reviews
 * @param context The context in which the user cannot view the reviews
 * @param numberToDisplay The number of fake reviews to display
 * @returns A component that displays a message and fake reviews
 * 
 */
function ReviewMissing({ reason, context }: ReviewMissingProps) {

    const no_login = reason === "No login";
    const no_auth = reason === "Not authorized";
    const no_reviews = reason === "No reviews";

    const no_login_text = "You must be logged in to view reviews";
    const no_auth_text = `You must review 2 courses before viewing ${context ?? ""} reviews`;
    const no_reviews_text = `There are no ${context ?? ""} reviews yet, be the first to write one!`;

    const reasontText = no_login ?
        no_login_text : no_auth ?
            no_auth_text : no_reviews ?
                no_reviews_text : "Something went wrong";

    return (
        <div className={styles.missingFallback}>
            <FiXCircle />
            <h4>{reasontText}</h4>
        </div>
    );


}

export default ReviewMissing;