import { getSession } from "next-auth/react";
import { CustomSession, public_instructor, public_review } from "../../lib/common/types";
import { getAllUserVotedReviews } from "../../lib/backend/database/review";
import ReviewList from "../../components/Review";
import { getAllInstructors } from "../../lib/backend/database/instructor";

export async function getServerSideProps(context) {
    const session = await getSession(context) as CustomSession;

    if (!session?.user) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    if (session.user.role !== "student") {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }


    const reviews = await getAllUserVotedReviews(session);
    const instructors = await getAllInstructors();

    return {
        props: {
            reviews,
            instructors,
        },
    }

}

interface VotesProps {
    reviews: public_review[];
    instructors: public_instructor[];
}



export function Votes({ reviews, instructors }: VotesProps) {

    return (
        <div>
            <h1>Voted Reviews</h1>
            <ReviewList
                reviews={reviews}
                identifyCourse
                identifyInstructor
                instructors={instructors}
            />
        </div>
    );



}


export default Votes;