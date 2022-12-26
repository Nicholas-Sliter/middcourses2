import PageTitle from "../../../components/common/PageTitle";
import ScrollableRow from "../../../components/common/ScrollableRow";
import CourseCardRow from "../../../components/CourseCardRow";
import getCourseRankings from "../../../lib/backend/rankings";


interface CourseRanking {
    title: string;
    description: string;
    type: string;
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


export async function getServerSideProps() {

    const rankings = await getCourseRankings() as Rankings;

    return {
        props: {
            rankings,
        },
    };
}



function CoursesPage({ rankings }: { rankings: Rankings }) {


    for (const [id, ranking] of Object.entries(rankings)) {
        console.log(id, ranking.title, ranking.description);
    }




    return (
        <>
            <PageTitle pageTitle="Browse Courses" />
            <div>
                {
                    Object.entries(rankings).map(([id, ranking]) => (
                        <div key={id}>
                            <h2>{ranking.title}</h2>
                            <p>{ranking.description}</p>

                            <CourseCardRow courses={ranking.courses} />

                        </div>
                    ))
                }

            </div>
        </>
    );

}

export default CoursesPage;