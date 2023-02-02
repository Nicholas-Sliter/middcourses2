import { public_course } from "../../lib/common/types";
import RatingBox from "../RatingBox";
import RatingBar from "./RatingBar";

interface CourseRatingBarProps {
    course: public_course
}


function CourseRatingBar({ course }: CourseRatingBarProps) {

    return (
        <RatingBar>
            <RatingBox
                title="Overall"
                value={course?.avgRating}
                suffix={"/10"}
                helpText="Average rating of all reviews"

            />
            <RatingBox
                title="Value"
                value={course?.avgValue}
                suffix={"/10"}
                helpText="Average value of all reviews"

            />
            <RatingBox
                title="Difficulty"
                value={course?.avgDifficulty}
                suffix={"/10"}
                highIsGood={false}
                helpText="Average difficulty of all reviews"
                offset={1}

            />
            <RatingBox
                title="Workload"
                value={course?.avgHours}
                suffix={"hrs"}
                max={12}
                highIsGood={false}
                offset={2.2}
                helpText="per week of work"

            />
            <RatingBox
                title="Again"
                value={course?.avgAgain}
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