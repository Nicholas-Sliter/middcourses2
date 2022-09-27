import { public_instructor, public_review } from "../../lib/common/types";
import { parseCourseID } from "../../lib/common/utils";
import ReadMore from "../common/ReadMore";
import TagBar from "../TagBar";
import styles from "./ReviewCard.module.scss";
import ReviewDetail from "./ReviewDetail";
import ReviewHeader from "./ReviewHeader";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import voteFetch from "../../lib/frontend/vote";


interface ReviewCardProps {
    review: public_review;
    instructor: public_instructor;
    expandable?: boolean;
    identifyCourse?: boolean;
    identifyInstructor?: boolean;
    hideVoting?: boolean;
}



function ReviewCard({
    review,
    instructor,
    expandable,
    identifyCourse,
    identifyInstructor,
    hideVoting
}: ReviewCardProps) {


    const [userVoteType, setUserVoteType] = useState(review.userVoteType);
    const toast = useToast();

    const vote = async (review: public_review, voteType: string, toast, updateVoteType) => {
        const { status, message, value } = await voteFetch(review.reviewID, voteType);
        if (status) {
            updateVoteType(value);
            review.userVoteType = value;
            toast({
                title: message,
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        }
        else {
            toast({
                title: message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });

        }

    }
    const voteWrapper = (voteType: string) => {
        vote(review, voteType, toast, setUserVoteType);
    }


    const { department, courseNumber } = parseCourseID(review?.courseID);
    if (!review || !department || !courseNumber) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <ReviewHeader
                    review={review}
                    instructor={instructor}
                    identifyCourse={identifyCourse}
                    identifyInstructor={identifyInstructor}
                    hideVoting={hideVoting}
                    hideDate={true}
                    userVoteType={userVoteType}
                    vote={voteWrapper}
                />
                <ReadMore text={review.content} maxLength={335} />
                <TagBar items={["Exciting course", "Lots of Homework"]} />
                <ReviewDetail review={review} />
            </div>
        </div>
    );




}

export default ReviewCard;