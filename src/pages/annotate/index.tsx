import { getSession } from "next-auth/react";
import { CustomSession, public_instructor, public_review } from "../../lib/common/types";
import { getMaxReviewPages, getNRandomUnvotedReviews } from "../../lib/backend/database/review";
import ReviewList from "../../components/Review";
import { getAllInstructors } from "../../lib/backend/database/instructor";
import { useRouter } from "next/router";
import PageTitle from "../../components/common/PageTitle";

export async function getServerSideProps(context) {
    const session = await getSession(context) as CustomSession;
    const authorized = session?.user?.authorized ?? false;
    const num = context.query.num ? parseInt(context.query.num as string) : 50;
    const page = context.query.page ? parseInt(context.query.page as string) : 0;

    const offset = page * num;

    if (isNaN(num) || isNaN(page) || num < 1 || page < 0 || offset < 0) {
        return {
            redirect: {
                destination: "/annotate",
                permanent: false,
            },
        };
    }

    if (!authorized) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }


    const reviews = await getNRandomUnvotedReviews(session, num, offset);
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

    const router = useRouter();

    const num = router.query.num ? parseInt(router.query.num as string) : 50;
    const page = router.query.page ? parseInt(router.query.page as string) : 0;

    const nextPage = () => {
        console.log("next page");
        router.push(`/annotate?num=${num}&page=${page + 1}`);
    }

    const hasPrevPage = page > 0;
    const prevPage = () => {
        if (!hasPrevPage) return;
        router.push(`/annotate?num=${num}&page=${page - 1}`);
    }

    return (
        <>
            <PageTitle pageTitle="Annotate" />
            <div>
                <h1>Annotate</h1>
                <button onClick={prevPage} disabled={!hasPrevPage}>Previous Page</button>
                <button onClick={nextPage}>Next Page</button>
                <ReviewList
                    reviews={reviews}
                    identifyCourse
                    identifyInstructor
                    instructors={instructors}
                />
                <button onClick={prevPage} disabled={!hasPrevPage}>Previous Page</button>
                <button onClick={nextPage}>Next Page</button>
                <div style={{ height: "100px" }} />
            </div>
        </>
    );



}


export default Annotate;