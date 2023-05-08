import { getSession } from "next-auth/react";
import { CustomSession, public_instructor, public_review } from "../../lib/common/types";
import { getAllUserVotedReviews } from "../../lib/backend/database/review";
import ReviewList from "../../components/Review";
import { getAllInstructors } from "../../lib/backend/database/instructor";

export async function getServerSideProps(context) {
    const session = await getSession(context) as CustomSession;
    const num = context.query.num ? parseInt(context.query.num as string) : 100;
    const page = context.query.page ? parseInt(context.query.page as string) : 0;
    const offset_amount = num * page;

    if (isNaN(num) || isNaN(page) || offset_amount < 0) {
        return {
            redirect: {
                destination: "/profile/votes",
                permanent: false,
            },
        };
    }

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


    const reviews = await getAllUserVotedReviews(session, num, offset_amount);
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