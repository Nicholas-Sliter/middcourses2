import process, { env } from "process";

const likeOperator = process.env.NODE_ENV === "production" ? "ilike" : "like";

export { likeOperator };

export const reviewInfo = [
    "Review.reviewID",
    "Review.courseID",
    "Review.instructorID",
    "Review.semester",
    "Review.reviewDate",
    "Review.rating",
    "Review.content",


    "Review.difficulty",
    "Review.value",
    "Review.hours",
    "Review.again",
    "Review.primaryComponent",
    "Review.tags",

    "Review.instructorEffectiveness",
    "Review.instructorAccommodationLevel",
    "Review.instructorEnthusiasm",
    "Review.instructorAgain",
    "Review.instructorEnjoyed",
];

export const basicReviewInfo = [
    "Review.reviewID",
    "Review.courseID",
    "Review.instructorID",
    "Review.semester",
    "Review.reviewDate",
    "Review.rating",
    "Review.content",
];