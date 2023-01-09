import { CustomSession, public_course, public_instructor, public_review } from "../../lib/common/types";
import { parseCourseID } from "../../lib/common/utils";
import ReadMore from "../common/ReadMore";
import TagBar from "../TagBar";
import styles from "./ReviewCard.module.scss";
import ReviewDetail from "./ReviewDetail";
import ReviewHeader from "./ReviewHeader";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import voteFetch from "../../lib/frontend/vote";
import { useSession } from "next-auth/react";


interface ReviewCardProps {
    review: public_review;
    instructor: public_instructor;
    expandable?: boolean;
    identifyCourse?: boolean;
    identifyInstructor?: boolean;
    hideVoting?: boolean;
    hideFlag?: boolean;
    AddReview?: (props: {
        isOpen: boolean,
        onClose: () => void,
        review: public_review,
        instructors: public_instructor[],
        course: public_course,
        edit: boolean
    } & React.ComponentPropsWithoutRef<"div">
    ) => React.ReactElement;
}

const votingWithoutLoginToast = (toast) => {
    toast({
        title: "You must be logged in to vote",
        status: "error",
        duration: 5000,
        isClosable: true,
    });
};

function ReviewCard({
    review,
    instructor,
    expandable,
    identifyCourse,
    identifyInstructor,
    hideVoting,
    hideFlag = false,
    AddReview,
}: ReviewCardProps) {

    const { data: session } = useSession() as { data: CustomSession };
    const [userVoteType, setUserVoteType] = useState(review.userVoteType);
    const toast = useToast();

    const editable = review.editable;

    const vote = async (review: public_review, voteType: string, toast, updateVoteType) => {
        //check if user is logged in
        if (!session?.user) {
            votingWithoutLoginToast(toast);
            return;
        }

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
                    hideFlag={hideFlag || editable}
                    showEdit={editable}
                    userVoteType={userVoteType}
                    vote={voteWrapper}
                    AddReview={AddReview}
                />
                <ReadMore text={review.content} maxLength={335} />
                <TagBar items={review?.tags ?? []} />
                <ReviewDetail review={review} />
            </div>
        </div>
    );




}

export default ReviewCard;