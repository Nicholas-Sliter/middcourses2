import RatingBox from "../RatingBox";
import RatingBar from "./RatingBar";

function CourseRatingBar({ course }) {
    return (
        <RatingBar>
            <RatingBox
                title="Overall"
                value={course?.courseRating ?? 9.8}
                suffix={"/10"}
                helpText="Average rating of all reviews"

            />
            <RatingBox
                title="Value"
                value={course?.courseValue ?? 7.2}
                suffix={"/10"}
                helpText="Average value of all reviews"

            />
            <RatingBox
                title="Difficulty"
                value={course?.courseDifficulty ?? 3.4}
                suffix={"/10"}
                highIsGood={false}
                helpText="Average difficulty of all reviews"

            />
            <RatingBox
                title="Workload"
                value={course?.courseHours ?? 8.2}
                suffix={"hrs"}
                helpText="per week of work"

            />
            <RatingBox
                title="Again"
                value={0.941324}
                suffix="%"
                max={1}
                min={0}
                displayPrecision={0}
                percent
                helpText="Would take this course again"

            />
        </RatingBar>
    )
}

export default CourseRatingBar;