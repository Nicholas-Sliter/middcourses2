import { Spacer } from "@chakra-ui/react";
import { getSession } from "next-auth/react";
import PageTitle from "../../../components/common/PageTitle";
import ScrollableRow from "../../../components/common/ScrollableRow";
import CourseCardRow from "../../../components/CourseCardRow";
import RankingBar from "../../../components/RankingBar";
import getCourseRankings from "../../../lib/backend/rankings";
import { CustomSession } from "../../../lib/common/types";


interface CourseRanking {
    title: string;
    description: string;
    type: string;
    displaySize?: string;
    courses: {
        courseID: string;
        courseName: string;
        courseDescription: string;
        numReviews: number;
        avgRating: number;

    }[];

}


interface Rankings {
    [id: string]: CourseRanking;
}


export async function getServerSideProps(context) {

    const session = await getSession(context) as CustomSession | null;
    const rankings = await getCourseRankings(session) as Rankings;

    return {
        props: {
            rankings,
        },
    };
}



function CoursesPage({ rankings }: { rankings: Rankings }) {

    return (
        <>
            <PageTitle pageTitle="Browse Courses" />
            <div>
                {
                    Object.entries(rankings).map(([id, ranking]) => (
                        <RankingBar key={id} id={id} title={ranking.title} description={ranking.description} type={ranking.type} displaySize={ranking.displaySize} data={ranking.courses} />
                    ))
                }

            </div>
            <div style={{ height: "100px" }} /> {/* Spacer */}
        </>
    );

}

export default CoursesPage;