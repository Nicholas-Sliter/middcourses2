import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Spacer,
    Tabs,
    Tab,
    TabPanels,
    TabPanel,
    TabList,
} from '@chakra-ui/react'
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import PageTitle from '../../components/common/PageTitle';
import ReviewList from '../../components/Review';
import useIsMount from "../../hooks/useIsMount";
import { getTopCourses, getTopCoursesByTagAgg, getTopDepartmentCourses, getTopInstructors, getTopValueForDifficultyCourses } from '../../lib/backend/database/rankings';
import { __getAllFullReviews } from "../../lib/backend/database/review";
import { __getAllFullUsers } from "../../lib/backend/database/users";
import { CustomSession } from "../../lib/common/types";
import signInRedirectHandler from "../../lib/frontend/login";

interface AdminDashboardProps {
    users: any[];
    reviews: any[];
    ranks: any[];
    iranks: any[];
    mode: string;

}


export async function getServerSideProps(context) {
    const session = await getSession(context) as CustomSession;


    if (!session) {
        return {
            redirect: {
                destination: "/auth/signin",
                permanent: false,
            }
        }
    }

    if (!session?.user?.admin) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            }
        }
    }


    const users = (await __getAllFullUsers()).sort((a, b) => {
        return a.createdAt < b.createdAt ? 1 : -1;
    });

    const reviews = (await __getAllFullReviews()).sort((a, b) => {
        return a.createdAt < b.createdAt ? 1 : -1;
    });

    // const ranks = (await getTopValueForDifficultyCourses(4));
    // const ranks = await getTopDepartmentCourses(session, 4)
    // const ranks = await getTopCoursesByTagAgg(session, 4)
    const ranks = (await getTopCourses(10));
    const iranks = (await getTopInstructors(10)).sort((a, b) => {
        const a_avgrating = (
            a.avgRating +
            a.instructorEffectiveness +
            a.instructorAccommodationLevel +
            a.instructorEnthusiasm +
            (10 * a.instructorAgain) +
            (10 * a.instructorEnjoyed)
        ) / 6;
        const b_avgrating = (
            b.avgRating +
            b.instructorEffectiveness +
            b.instructorAccommodationLevel +
            b.instructorEnthusiasm +
            (10 * b.instructorAgain) +
            (10 * b.instructorEnjoyed)
        ) / 6;

        return a_avgrating < b_avgrating ? 1 : -1;
    });


    const mode = process.env.NODE_ENV;

    return {
        props: {
            users: JSON.parse(JSON.stringify(users)),
            reviews: JSON.parse(JSON.stringify(reviews)),
            ranks: JSON.parse(JSON.stringify(ranks)),
            iranks: JSON.parse(JSON.stringify(iranks)),
            mode: mode
        }
    }


}



function AdminDashboard({
    users,
    reviews,
    ranks,
    iranks,
    mode

}: AdminDashboardProps) {


    const { data: session } = useSession() as { data: CustomSession };
    const router = useRouter();
    const isMount = useIsMount();

    useEffect(() => {
        //if not logged in, redirect to login
        if (isMount && (!session || !session.user)) {
            //router.push("/login");
            //signInRedirectHandler();
        }
        //if not admin, redirect to home
        else if (isMount && !session?.user?.admin) {
            router.push("/");
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, isMount]);


    const deleteFun = (id, permanent = false) => {
        console.log(id);

        //type the last 5 characters of the id to confirm
        //if correct, delete

        const res = prompt(`Are you sure you want to delete this review with id: ${id}? This action is ${permanent ? "permanent" : "temporary"}. Type ${id.slice(-5)} of the id to confirm`);


        if (res !== id.slice(-5)) {
            return;
        }

        fetch(`/api/reviews/${id}/delete?permanent=${permanent.toString()}`, {
            method: "POST", //change to delete and move to reviews/[id]
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: id,
            })
        })

    }

    const insertReviewToDB = (review) => {
        fetch(`/api/reviews/${review.reviewID}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...review,
            })
        })
    }

    const refreshUser = (id) => {
        console.log(`refreshing user ${id}`);
        fetch(`/api/profile/${id}/refresh`, { //change to POST and users
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
    }


    return (
        <>
            <PageTitle pageTitle="Admin Dashboard" />
            <div>
                <h1>Admin Dashboard - {mode}</h1>
                <Tabs>
                    <TabList>
                        <Tab>Users</Tab>
                        <Tab>Reviews</Tab>
                        <Tab>Rankings</Tab>
                    </TabList>


                    <TabPanels>
                        {/* Users table */}
                        <TabPanel>
                            <h2>Users</h2>
                            <p>{`${users.length} users`}</p>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th>Email</Th>
                                        <Th>Type</Th>
                                        <Th>Read</Th>
                                        <Th>Created</Th>
                                        <Th>Refresh</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {users.map((user) => {
                                        return (
                                            <Tr key={user.userEmail}>
                                                <Td>{user.userEmail}</Td>
                                                <Td>{user.userType}</Td>
                                                <Td>{user.canReadReviews.toString()}</Td>
                                                <Td>{user.createdAt}</Td>
                                                <Td><button onClick={() => refreshUser(user.userID)}>Refresh</button></Td>
                                            </Tr>
                                        )
                                    })}
                                </Tbody>
                            </Table>
                        </TabPanel>
                        {/* Reviews table */}
                        <TabPanel>
                            <h2>Reviews</h2>
                            <p>{`${reviews.length} reviews`}</p>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th>Review ID</Th>
                                        <Th>Reviewer</Th>
                                        <Th>Instructor ID</Th>
                                        <Th>Course ID</Th>
                                        <Th>Created</Th>
                                        <Th>DELETE</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {reviews.map((review) => {
                                        return (
                                            <Tr key={review.reviewID}>
                                                <Td>{review.reviewID}</Td>
                                                <Td>{review.reviewerID}</Td>
                                                <Td>{review.instructorID}</Td>
                                                <Td>{review.courseID}</Td>
                                                <Td>{review.reviewDate}</Td>
                                                <Td><button
                                                    onClick={() => {
                                                        deleteFun(review.reviewID, true);
                                                    }}
                                                >DELETE</button></Td>
                                            </Tr>
                                        )
                                    })}
                                </Tbody>
                            </Table>
                        </TabPanel>
                        {/* Recommendations table */}
                        <TabPanel>
                            <h2>Rankings</h2>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th>Course ID</Th>
                                        <Th>Course Name</Th>
                                        <Th>Value-for-difficulty</Th>
                                        <Th>Rank</Th>

                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {ranks.map((ranks, i) => {
                                        return (
                                            <Tr key={ranks.courseID}>
                                                <Td>{ranks.courseID}</Td>
                                                <Td>{ranks.courseName}</Td>
                                                <Td>{((ranks.avgValue + 1) / (ranks.avgDifficulty + 1)).toFixed(2)}</Td>
                                                <Td>{i + 1}</Td>
                                            </Tr>
                                        )
                                    })}
                                </Tbody>


                            </Table>
                            <hr />
                            <h2>Instructors</h2>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th>Instructor ID</Th>
                                        <Th>Instructor Name</Th>
                                        <Th>Rank</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {iranks.map((instructor, i) => {
                                        return (
                                            <Tr key={instructor.instructorID}>
                                                <Td>{instructor.instructorID}</Td>
                                                <Td>{instructor.instructorName}</Td>
                                                <Td>{i + 1}</Td>
                                            </Tr>
                                        )
                                    })}
                                </Tbody>
                            </Table>

                        </TabPanel>
                    </TabPanels>
                </Tabs>

                <div style={{ height: "3rem" }} />
            </div >
        </>
    )
}

export default AdminDashboard;