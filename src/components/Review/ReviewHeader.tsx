import { Tooltip } from "@chakra-ui/react";
import Link from "next/link";
import {
    FaRegLaughBeam,
    FaRegLaugh,
    FaRegSmile,
    FaRegMeh,
    FaRegFrown,
    FaRegTired,
} from "react-icons/fa";
import {
    MdThumbUp,
    MdThumbDown,
    MdThumbUpOffAlt,
    MdThumbDownOffAlt,
} from "react-icons/md";
import { ratingMapping } from "../../lib/frontend/utils";
import { public_course, public_instructor, public_review } from "../../lib/common/types";
import styles from "./ReviewHeader.module.scss";
import DateString from "../common/DateString";
import { FiFlag, FiEdit } from "react-icons/fi";
import FlagDialog from "./FlagDialog";
import { useState } from "react";
// import AddReview from "../AddReview";

interface ReviewHeaderProps {
    review: public_review;
    instructor: public_instructor;
    identifyCourse?: boolean;
    identifyInstructor?: boolean;
    hideVoting?: boolean;
    // vote: (vote: boolean) => void;
    hideDate?: boolean;
    userVoteType?: 1 | -1
    vote: (voteType: string) => void;
    hideFlag?: boolean;
    showEdit?: boolean;
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

const ratingIconMapping = {
    1: <FaRegTired />,
    2: <FaRegFrown />,
    3: <FaRegFrown />,
    4: <FaRegMeh />,
    5: <FaRegMeh />,
    6: <FaRegSmile />,
    7: <FaRegSmile />,
    8: <FaRegLaugh />,
    9: <FaRegLaugh />,
    10: <FaRegLaughBeam />,
};

const ratingColorMapping = {
    1: "red",
    2: "red",
    3: "orange",
    4: "orange",
    5: "yellow",
    6: "yellow",
    7: "light-green",
    8: "light-green",
    9: "green",
    10: "green",
};


function ReviewHeader({
    review,
    instructor,
    identifyCourse = false,
    identifyInstructor = false,
    hideVoting = false,
    userVoteType,
    hideDate = false,
    hideFlag = false,
    showEdit = false,
    vote,
    AddReview,
}: ReviewHeaderProps) {
    const [flagButtonOpen, setFlagButtonOpen] = useState(false);
    const [editButtonOpen, setEditButtonOpen] = useState(false);
    const department = review?.courseID?.slice(0, 4)?.toLowerCase();
    const courseNumber = review?.courseID?.slice(4);

    const course: public_course = {
        courseID: review.courseID,
        courseName: review.courseID,
        courseDescription: "",
        departmentID: department,
        departmentName: department.toUpperCase(),
    };


    const editButtonClick = () => {
        setEditButtonOpen(true);
    };

    const flagButtonClick = () => {
        setFlagButtonOpen(!flagButtonOpen);
    };


    const instructorElement = (identifyInstructor) ? (<>{" with "} <Link href={`/instructor/${instructor?.slug}`}>
        <a className={styles.instructorLink}>{instructor?.name}</a>
    </Link></>) : "";

    const LikeIcon = () => (userVoteType === 1) ? <MdThumbUp /> : <MdThumbUpOffAlt />;
    const DislikeIcon = () => (userVoteType === -1) ? <MdThumbDown /> : <MdThumbDownOffAlt />;

    const FlagElement = () => {
        if (hideFlag) return null;
        return (
            <Tooltip label="Flag harmful review">
                <button
                    aria-label="Flag Review"
                    className={styles.flag}
                    onClick={flagButtonClick}
                >
                    <FiFlag />
                </button>
            </Tooltip>
        );
    };

    if (!AddReview) {
        AddReview = function emptyAddReview() { return (null) };
    }


    const EditElement = () => {
        if (!showEdit) return null;
        return (
            <Tooltip label="Edit review">
                <button
                    aria-label="Edit Review"
                    onClick={editButtonClick}
                >
                    <FiEdit />
                </button>
            </Tooltip >
        );
    }


    const LikeDislikeElement = () => (hideVoting) ? null : (
        <>
            <Tooltip label={`${(userVoteType === 1) ? "Remove " : ""}Upvote`}>
                <button
                    aria-label="Upvote"
                    //title="Helpful"
                    className={`${styles.upvote} ${(userVoteType === 1) ? styles.upvoted : ""}`}
                    onClick={() => vote("up")}
                >
                    <LikeIcon />
                </button>
            </Tooltip>
            <Tooltip label={`${(userVoteType === -1) ? "Remove " : ""}Downvote`}>

                <button
                    aria-label="Downvote"
                    //title="Not helpful"
                    className={`${styles.downvote} ${(userVoteType === -1) ? styles.downvoted : ""}`}
                    onClick={() => vote("down")}
                >
                    <DislikeIcon />
                </button>
            </Tooltip>
        </>

    );

    return (
        <div className={styles.headerContainer}>
            <div className={styles.identity}>
                <Tooltip placement="right" label={`${ratingMapping[review.rating]}: ${review.rating} out of 10`}>
                    <span
                        className={styles[ratingColorMapping[review.rating]]}
                        aria-label="Rating"
                        aria-valuetext={`${review.rating} out of 10`}
                    >
                        {ratingIconMapping[review.rating]}
                    </span>
                </Tooltip>
                <span>
                    {" "}
                    {identifyCourse ? (
                        <Link href={`/reviews/${department}/${courseNumber}`}>
                            <a>{review.courseID}</a>
                        </Link>
                    ) : (
                        ""
                    )}
                    {instructorElement}
                </span>
                <DateString date={review.reviewDate} titlePrefix="Posted on" />
            </div>


            <div className={styles.controls}>
                <LikeDislikeElement />
                <FlagElement />
                <EditElement />
                <AddReview /*This might become a performance issue */
                    isOpen={editButtonOpen}
                    onClose={() => setEditButtonOpen(false)}
                    review={review}
                    instructors={[instructor]}
                    course={course}
                    edit
                />
                <FlagDialog
                    review={review}
                    isOpen={flagButtonOpen}
                    setOpen={setFlagButtonOpen} />
            </div>
        </div>
    )
}

export default ReviewHeader;