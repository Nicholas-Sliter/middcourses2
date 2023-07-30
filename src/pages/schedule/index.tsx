/**
 * @file Schedule page
 * @module pages/schedule
 * @see https://nextjs.org/docs/basic-features/pages
 * 
 * Course schedule page where students can build and compare their schedules.
 * Shows a list of bookmarked courses and allows students to construct multiple schedules.
 * Includes estimated workload and time commitment. (IE, in-class hours + out of class hours)
 */

import { getSession } from "next-auth/react";
import { BrowserView, MobileView } from "../../components/DeviceViews";
import ScheduleCalendar from "../../components/ScheduleCalendar";
import PageTitle from "../../components/common/PageTitle";
import SidebarLayout from "../../layouts/SidebarLayout";
import { CatalogCourse, CustomSession, Schedule, public_course } from "../../lib/common/types";
import { getCurrentTerm, getNextTerm } from "../../lib/common/utils";
import { getAllBookmarksInSemester, getAllUserBookmarks } from "../../lib/backend/database/bookmark";
import { Button, Select } from "@chakra-ui/react";
import { convertTermToFullString } from "../../lib/frontend/utils";
import useSchedule from "../../hooks/useSchedule";
import { Router, useRouter } from "next/router";
import { getSchedulePlansForSemester } from "../../lib/backend/database/schedule";
import { BsJustify } from "react-icons/bs";
import { useState } from "react";
import AddButton from "../../components/common/AddButton";
import AddToScheduleButton from "../../components/common/EditScheduleButton";
import EditScheduleButton from "../../components/common/EditScheduleButton";
import CourseCard from "../../components/CourseCard";
import CourseScheduleInfo from "../../components/CourseScheduleInfo";

export async function getServerSideProps(context) {

    const session = await getSession(context) as CustomSession;
    const currentTerms = [getCurrentTerm(), getNextTerm()];
    const term = (context.query.term ?? currentTerms[0]) as string;

    if (!currentTerms.includes(term)) {
        return {
            redirect: {
                destination: `/schedule?term=${currentTerms[0]}`,
                permanent: false,
            },
        }
    }

    const authorized = session?.user?.authorized ?? false;

    const mobileUserAgent = context.req.headers["user-agent"].toLowerCase().includes("mobile");


    const userBookmarks = await getAllUserBookmarks(session);

    const bookmarkedCourses = await getAllBookmarksInSemester(session, term);

    // const schedules = await getSchedulePlansForSemester(session, term);

    const schedules: Schedule[] = [
        {
            id: 1,
            userID: session?.user?.id ?? null,
            name: "Schedule 1",
            courses: [],
            semester: term,
        }];


    // get schedule difficulties


    return {
        props: {
            term: term,
            currentTerms: currentTerms,

            courses: bookmarkedCourses,
            bookmarks: userBookmarks,

            schedules: JSON.parse(JSON.stringify(schedules)),

            authorized: authorized,
            mobileUserAgent: mobileUserAgent,

        },
    }
}

interface ScheduleProps {
    term: string;
    currentTerms: string[];
    courses: CatalogCourse[];
    bookmarks: any[];
    schedules: Schedule[];
    authorized: boolean;
    mobileUserAgent: boolean;
}

function Schedule({
    term,
    currentTerms,
    courses,
    bookmarks,
    schedules,
    authorized,
    mobileUserAgent,

}: ScheduleProps) {

    // const session = a
    // const { bookmarks, schedules } = await useSchedule(session, term);
    const router = useRouter();

    const [selectedSchedule, setSelectedSchedule] = useState<Schedule>(schedules?.[0] ?? null);

    console.log(bookmarks, schedules);

    return (
        <>
            <PageTitle
                pageTitle="Schedule Planner"

            />
            <BrowserView renderDefault={!mobileUserAgent}>
                <SidebarLayout>
                    <SidebarLayout.Sidebar>
                        <div
                            style={{
                                marginLeft: "1rem",
                                marginRight: "1rem",
                                overflow: "hidden",
                                overflowX: "hidden",
                                boxSizing: "border-box",
                            }}

                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "left",
                                    alignItems: "center", overflow: "hidden",
                                    overflowX: "hidden",
                                    boxSizing: "border-box",
                                }}
                            >
                                <h1
                                    style={{
                                        display: "inline-block",
                                        verticalAlign: "bottom",

                                    }}
                                >Schedule</h1>
                                <Select
                                    width={"50%"}
                                    maxWidth={"12rem"}
                                    display={"inline"}
                                    verticalAlign={"bottom"}
                                    style={{
                                        outline: "none",
                                        // maxWidth: '9rem',
                                        border: "none",
                                        display: "inline",
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                        fontSize: "1.4rem",
                                        paddingTop: "0.1rem",
                                        verticalAlign: "bottom",
                                        paddingLeft: "0.5rem",
                                        // paddingRight: "0.5rem",
                                        margin: "0",
                                        // hover: {
                                        //     textDecoration: "dashed",
                                        // }
                                    }}
                                    _hover={{
                                        textDecoration: "dotted",
                                    }}
                                    defaultValue={currentTerms[0]}
                                    onChange={(e) => {
                                        router.push(`/schedule?term=${e.target.value}`)

                                    }}
                                >
                                    <option value={currentTerms[0]}>{convertTermToFullString(currentTerms[0])}</option>
                                    <option value={currentTerms[1]}>{convertTermToFullString(currentTerms[1])}</option>
                                </Select>
                            </div>
                            <div
                                style={{
                                    display: "flex"
                                }}
                            >
                                <Select
                                    placeholder="Select a schedule"
                                    defaultValue={selectedSchedule?.id ?? null}
                                    onChange={(e) => {
                                        setSelectedSchedule(schedules.find((schedule) => schedule.id === parseInt(e.target.value)) ?? null);
                                    }}
                                >
                                    {/* <option value="schedule1">Schedule 1</option>
                                    <option value="schedule2">Schedule 2</option> */}
                                    {schedules.map((schedule) => {
                                        return (
                                            <option key={schedule.id} value={schedule.id}>{schedule.name}</option>
                                        )
                                    }
                                    )}

                                </Select>
                                <Button
                                    disabled={!selectedSchedule}
                                >
                                    X
                                </Button>
                                <Button>New</Button>
                            </div>
                            <CourseScheduleInfo courses={selectedSchedule?.courses} />


                        </div>

                        <br />

                        {/* <h2>Bookmarked Courses</h2>
                        <ul>
                            {bookmarks.map((bookmark) => {
                                return (
                                    <li key={bookmark}>
                                        {bookmark}
                                    </li>
                                )
                            })}
                        </ul> */}


                    </SidebarLayout.Sidebar>
                    <SidebarLayout.Main>
                        <div style={{
                            display: "flex",
                            flex: "1 3",
                            flexDirection: "column",
                            height: "100%"
                        }}>
                            <div style={{
                                display: "flex",
                                alignItems: "flex-end",
                                justifyContent: "center",
                                flexGrow: 1,

                            }}>
                                <ScheduleCalendar schedule={selectedSchedule} />
                            </div>
                        </div>


                    </SidebarLayout.Main>
                </SidebarLayout>
                <EditScheduleButton />


            </BrowserView >


            <MobileView renderDefault={mobileUserAgent}>
                <p>The schedule planner requires a larger display</p>



            </MobileView>

        </>

    );


}



export default Schedule;