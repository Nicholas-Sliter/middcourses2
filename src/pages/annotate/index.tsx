import { getSession } from "next-auth/react";
import { CustomSession, public_instructor, public_review } from "../../lib/common/types";
import { getNRandomUnvotedReviews } from "../../lib/backend/database/review";
import ReviewList from "../../components/Review";
import { getAllInstructors } from "../../lib/backend/database/instructor";

export async function getServerSideProps(context) {
    const session = await getSession(context) as CustomSession;
    const authorized = session?.user?.authorized ?? false;

    if (!authorized) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    const num = 100;


    const reviews = await getNRandomUnvotedReviews(session, num);
    const instructors = await getAllInstructors();

    return {
        props: {
            reviews,
            instructors,
        },
    }

}

interface AnnotateProps {
    reviews: public_review[];
    instructors: public_instructor[];
}



export function Annotate({ reviews, instructors }: AnnotateProps) {

    return (
        <div>
            <h1>Annotate</h1>
            <ReviewList
                reviews={reviews}
                identifyCourse
                identifyInstructor
                instructors={instructors}



            />
        </div>
    );



}


export default Annotate;