import RatingBox from "../RatingBox";
import RatingBar from "./RatingBar";

function InstructorRatingBar({ instructor, noMargin = false }) {
    const style = noMargin ? {} : { marginRight: '2rem', marginLeft: '2rem' };

    return (
        <div style={style}>
            <RatingBar >
                {/* <RatingBox
                title="Overall"
                value={instructor.overall ?? 4.8}
                suffix={"/10"}
                helpText="Overall instructor rating"

            /> */}
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
                    helpText="Accomodation level of this instructor"

                />
                <RatingBox
                    title="Enjoy"
                    value={instructor?.avgEnjoyed}
                    suffix="%"
                    max={1}
                    min={0}
                    displayPrecision={0}
                    percent
                    helpText="Would take a course with this instructor again"

                />
                <RatingBox
                    title="Again"
                    value={instructor?.avgAgain} //this should be avgInstructionAgain!!!!!!!!!!!!!!!!!
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