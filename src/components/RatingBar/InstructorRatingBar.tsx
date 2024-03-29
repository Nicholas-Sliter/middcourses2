import RatingBox from "../RatingBox";
import RatingBar from "./RatingBar";

function InstructorRatingBar({ instructor, noMargin = false }) {
    const style = noMargin ? { marginLeft: '0', marginRight: '0' } : { marginRight: '1rem', marginLeft: '1rem' };

    return (
        <div style={{
            ...style,
            width: "100%",
        }}>
            <RatingBar >
                <RatingBox
                    title="Effective"
                    value={instructor.avgEffectiveness}
                    suffix={"/10"}
                    helpText="Instructor effectiveness"

                />
                <RatingBox
                    title="Fun"
                    value={instructor?.avgEnthusiasm}
                    suffix={"/10"}
                    helpText="Enthusiasm level of this instructor"

                />
                <RatingBox
                    title="Helpful"
                    value={instructor?.avgAccommodationLevel}
                    suffix={"/10"}
                    helpText="Accommodation level of this instructor"

                />
                <RatingBox
                    title="Enjoy"
                    value={instructor?.avgEnjoyed}
                    suffix="%"
                    max={1}
                    min={0}
                    displayPrecision={0}
                    percent
                    helpText="Enjoyed this instructor's teaching style"

                />
                <RatingBox
                    title="Again"
                    value={instructor?.avgAgain}
                    suffix="%"
                    max={1}
                    min={0}
                    displayPrecision={0}
                    percent
                    helpText="Would take a course with this instructor again"

                />
            </RatingBar>
        </div>
    )
}

export default InstructorRatingBar;