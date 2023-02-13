import { Spacer } from "@chakra-ui/react";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import PageTitle from "../../../components/common/PageTitle";
import ScrollableRow from "../../../components/common/ScrollableRow";
import CourseCardRow from "../../../components/CourseCardRow";
import RankingBar from "../../../components/RankingBar";
import RecommendationBar from "../../../components/RecommendationBar";
import { getCoursesInformation } from "../../../lib/backend/database/course";
import getCourseRankings from "../../../lib/backend/rankings";
import { getRecommendationsForUser } from "../../../lib/backend/recommendations";
import { CustomSession, public_course } from "../../../lib/common/types";


interface CourseRanking {
    data?: any;
    title: string;
    description: string;
    type: string;
    displaySize?: string;
    message?: string;
    error?: boolean;
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

// interface Recommendations {
//     message: string;
//     error: boolean;
//     courses: public_course[];
// }

interface CourseRankingsPageProps {
    rankings: Rankings;
    session: CustomSession | null;
}


export async function getServerSideProps(context) {

    const session = await getSession(context) as CustomSession | null;
    const rankings = await getCourseRankings(session) as Rankings;

    return {
        props: {
            session,
            rankings,

        },
    };
}



function CoursesPage({ rankings, session }: CourseRankingsPageProps) {

    const metaDescription = "Discover top-ranked Middlebury courses and view personalized recommendations from COURSERANK based on your previous course review history";
    const canonicalURL = "https://midd.courses/browse/courses";
    const socialImage = "https://midd.courses/images/courserank-social-card.png";


    return (
        <>
            <PageTitle pageTitle="Browse Courses" description={metaDescription} canonicalURL={canonicalURL} socialImage={socialImage} />
            <div>
                <h1 style={{ fontSize: '0px', color: 'rgba(0,0,0,0)', margin: 0, visibility: 'hidden' }}>Browse Course Rankings and Recommendations</h1>
                <RecommendationBar
                    id="COURSERANK"
                    key="COURSERANK"
                    title={rankings?.["recommendations"].title ?? "Recommended Courses"}
                    description={rankings?.["recommendations"].description ?? "Based on your previous course history"}
                    type="course"
                    displaySize="large"
                    data={rankings?.["recommendations"].courses}
                    error={rankings?.["recommendations"].error ?? false}
                    message={rankings?.["recommendations"].message ?? ""}
                    statusData={rankings?.["recommendations"]?.data ?? {}}

                />
                {
                    Object.entries(rankings)
                        .filter(([id, _]) => id !== "recommendations")
                        .map(([id, ranking]) => (
                            <RankingBar key={id} id={id} title={ranking.title} description={ranking.description} type={ranking.type} displaySize={ranking.displaySize} data={ranking.courses} />
                        ))
                }

            </div>
            <div style={{ height: "100px" }} /> {/* Spacer */}
        </>
    );

}

export default CoursesPage;