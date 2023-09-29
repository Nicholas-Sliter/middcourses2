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
import { Button, Select, Tooltip } from "@chakra-ui/react";
import { convertTermToFullString } from "../../lib/frontend/utils";
import useSchedule from "../../hooks/useSchedule";
import { Router, useRouter } from "next/router";
import { getSchedulePlansForSemester, getSchedulePlansForSemesters } from "../../lib/backend/database/schedule";
import { BsJustify } from "react-icons/bs";
import { useEffect, useReducer, useState } from "react";
import AddButton from "../../components/common/AddButton";
import AddToScheduleButton from "../../components/common/EditScheduleButton";
import EditScheduleButton from "../../components/common/EditScheduleButton";
import CourseCard from "../../components/CourseCard";
import CourseScheduleInfo from "../../components/CourseScheduleInfo";
import { FiDelete } from "react-icons/fi";
import { MdOutlineAdd, MdOutlineDelete } from "react-icons/md";
import { AddCourseToScheduleModal, DeleteScheduleConfirmation, NewScheduleModal } from "../../components/Schedule";

export async function getServerSideProps(context) {

    const session = await getSession(context) as CustomSession;
    const currentTerms = [getCurrentTerm(), getNextTerm()];
    const term = (context.query.term ?? currentTerms[0]) as string;

    // if (!currentTerms.includes(term)) {
    //     return {
    //         redirect: {
    //             destination: `/schedule?term=${currentTerms[0]}`,
    //             permanent: false,
    //         },
    //     }
    // }

    const authorized = session?.user?.authorized ?? false;

    const mobileUserAgent = context.req.headers["user-agent"].toLowerCase().includes("mobile");


    const userBookmarks = await getAllUserBookmarks(session);

    const bookmarkedCourses = await getAllBookmarksInSemester(session, term);

    const schedules = await getSchedulePlansForSemesters(session, currentTerms);

    // schedules.forEach(schedule => {
    //     schedule.courses = [{
    //         courseName: "Software Engineering",
    //         courseID: "CSCI0312",
    //         catalogID: "CSCI0312A-F23",
    //         courseDescription: "...",
    //         semester: "F23",
    //         crn: "12345",
    //         section: "A",
    //         isLinkedSection: false,
    //         times: [
    //             ["0", [{
    //                 day: "Monday",
    //                 start: 8 * 60,
    //                 end: 9 * 60 + 15,

    //             }, {
    //                 day: "Wednesday",
    //                 start: 8 * 60,
    //                 end: 9 * 60 + 15,

    //             }]],

    //         ]
    //     }]

    // })

    // const schedules: Schedule[] = [
    //     {
    //         id: 1,
    //         userID: session?.user?.id ?? null,
    //         name: "Schedule 1",
    //         courses: [
    // {
    //     courseName: "Software Engineering",
    //     courseID: "CSCI0312",
    //     catalogID: "CSCI0312A-F23",
    //     courseDescription: "...",
    //     semester: "F23",
    //     crn: "12345",
    //     section: "A",
    //     isLinkedSection: false,
    //     times: [
    //         ["0", [{
    //             day: "Monday",
    //             start: 8 * 60,
    //             end: 9 * 60 + 15,

    //         }, {
    //             day: "Wednesday",
    //             start: 8 * 60,
    //             end: 9 * 60 + 15,

    //         }]],

    //     ],



    //             }
    //         ],
    //         semester: term,
    // }];


    // get schedule difficulties

    console.log(JSON.stringify(schedules));


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

    const [userTerm, setUserTerm] = useState<string>(term);
    const [userSchedules, setUserSchedules] = useState<Schedule[]>(schedules ?? []);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule>(schedules?.[0] ?? null);
    const [newScheduleModalOpen, setNewScheduleModalOpen] = useState<boolean>(false);
    const [deleteScheduleModalOpen, setDeleteScheduleModalOpen] = useState<boolean>(false);
    const [addCourseModalOpen, setAddCourseModalOpen] = useState<boolean>(false);


    /* Update selected schedule when term changes. Try to select the first schedule in the new term. */
    useEffect(() => {
        const newSchedule = userSchedules
            .filter((schedule) => schedule.semester === userTerm)
            .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1)
            ?.[0] ?? null;
        setSelectedSchedule(newSchedule);
    }, [userTerm, userSchedules]);


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
                                    defaultValue={term}

                                    onChange={(e) => {
                                        setSelectedSchedule(null);
                                        setUserTerm(e.target.value);
                                    }}
                                >
                                    <option value={currentTerms[0]}>{convertTermToFullString(currentTerms[0])}</option>
                                    <option value={currentTerms[1]}>{convertTermToFullString(currentTerms[1])}</option>
                                </Select>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    // paddingTop: "0.1rem",
                                    // paddingBottom: "0.1rem",
                                    height: "2.5rem",

                                    padding: '0.1rem',

                                }}
                            >
                                <Select
                                    style={{
                                        margin: 0,
                                        // border: "1px solid #ccc",
                                        // display: "inline-block",
                                        border: "1px solid #ccc",
                                        // outline: "1px solid #ccc",
                                        borderRadius: "0.5rem",

                                        // height: "2.5rem",
                                    }}
                                    placeholder={"Select Schedule"}
                                    disabled={userSchedules.length === 0}
                                    defaultValue={selectedSchedule?.id ?? null}
                                    value={selectedSchedule?.id ?? null}
                                    onChange={(e) => {
                                        setSelectedSchedule(userSchedules.find((schedule) => schedule.id === parseInt(e.target.value)) ?? null);
                                    }}
                                >
                                    {/* <option value="schedule1">Schedule 1</option>
                                    <option value="schedule2">Schedule 2</option> */}
                                    {userSchedules
                                        .filter((schedule) => {
                                            return (schedule.semester === userTerm);
                                        })
                                        .map((schedule) => {
                                            return (
                                                <option key={schedule.id} value={schedule.id}>{schedule.name}</option>
                                            )
                                        }
                                        )}

                                </Select>
                                <div
                                    style={{

                                        marginLeft: "0.5rem",
                                        display: "flex",
                                        // justifyContent: "center",
                                        // alignItems: "center",
                                        flexDirection: "row",
                                        flexWrap: "nowrap",
                                        // border: "none",
                                        outline: "1px solid #ccc",
                                        borderRadius: "0.5rem",
                                        // height: "2.5rem",
                                        boxSizing: "border-box",
                                        padding: "0",
                                    }}
                                >
                                    <Tooltip label="Delete Schedule">
                                        <Button
                                            style={{
                                                // height: "2.5rem",
                                                padding: "0",
                                                border: "none",
                                                backgroundColor: "transparent",
                                                // fontSize: "1.5rem",
                                                cursor: "pointer",
                                                borderRight: "1px solid #ccc",
                                                borderTopRightRadius: "0",
                                                borderBottomRightRadius: "0",

                                            }}
                                            disabled={!selectedSchedule}
                                            onClick={() => setDeleteScheduleModalOpen(true)}
                                        >

                                            <MdOutlineDelete />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip label="Create New Schedule">
                                        <Button
                                            onClick={() => setNewScheduleModalOpen(true)}
                                            style={{
                                                padding: "0",
                                                border: "none",
                                                backgroundColor: "transparent",
                                                // borderLeft: "1px solid #ccc",
                                                // fontSize: "1.5rem",
                                                cursor: "pointer",
                                                borderTopLeftRadius: "0",
                                                borderBottomLeftRadius: "0",
                                            }}
                                        >
                                            <MdOutlineAdd />
                                        </Button>
                                    </Tooltip>
                                </div>
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
                <EditScheduleButton
                    onClick={() => setAddCourseModalOpen(true)}
                />


            </BrowserView >


            <MobileView renderDefault={mobileUserAgent}>
                <p>The schedule planner requires a larger display</p>



            </MobileView>

            <NewScheduleModal
                isOpen={newScheduleModalOpen}
                onClose={() => setNewScheduleModalOpen(false)}
                onScheduleCreated={(schedule) => {
                    setUserSchedules([...userSchedules, schedule]);
                    setSelectedSchedule(schedule);
                }}
                semesterOptions={currentTerms.map((term) => {
                    return {
                        value: term,
                        label: convertTermToFullString(term),
                    }
                })}
                defaultSemester={term}

            />
            <DeleteScheduleConfirmation
                isOpen={deleteScheduleModalOpen}
                onClose={() => setDeleteScheduleModalOpen(false)}
                schedule={selectedSchedule}
                onDeleted={() => {
                    setUserSchedules(userSchedules.filter((schedule) => schedule.id !== selectedSchedule.id));
                    setSelectedSchedule(null);
                }}
            />
            <AddCourseToScheduleModal
                isOpen={addCourseModalOpen}
                onClose={() => setAddCourseModalOpen(false)}
                onCourseAdded={() => { }}
                schedule={selectedSchedule}
            />


        </>

    );


}



export default Schedule;