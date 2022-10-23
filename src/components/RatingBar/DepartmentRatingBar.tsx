import { extended_department, public_course, public_instructor } from "../../lib/common/types";
import RatingBox from "../RatingBox";
import CourseRatingBar from "./CourseRatingBar";
import InstructorRatingBar from "./InstructorRatingBar";
import RatingBar from "./RatingBar";

interface DepartmentRatingBarProps {
    department: extended_department;
    mode: "course" | "instructor";
}


function DepartmentRatingBar({ department, mode }: DepartmentRatingBarProps) {

    if (mode === "course") {
        const course = department as unknown as public_course;
        return (
            <CourseRatingBar course={course} />
        )
    }
    if (mode == "instructor") {
        const instructor = {
            avgEffectiveness: department.avgEffectiveness,
            avgEnthusiasm: department.avgEnthusiasm,
            avgAccommodationLevel: department.avgAccommodationLevel,
            avgAgain: department.avgInstructorAgain,
            avgEnjoyed: department.avgInstructorEnjoyed,
        } as unknown as public_instructor;
        //const instructor = department as unknown as public_instructor;
        return (
            <InstructorRatingBar instructor={instructor} noMargin />
        )
    }


    return (
        <RatingBar>
            <RatingBox
                title="Overall"
                value={department?.avgRating}
                suffix={"/10"}
                helpText="Average rating of all reviews"

            />
            <RatingBox
                title="Value"
                value={department?.avgValue}
                suffix={"/10"}
                helpText="Average value of all reviews"

            />
            <RatingBox
                title="Difficulty"
                value={department?.avgDifficulty}
                suffix={"/10"}
                highIsGood={false}
                helpText="Average difficulty of all reviews"

            />
            <RatingBox
                title="Workload"
                value={department?.avgHours}
                suffix={"hrs"}
                max={12}
                highIsGood={false}
                helpText="per week of work"

            />
            <RatingBox
                title="Again"
                value={department?.avgAgain}
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

export default DepartmentRatingBar;