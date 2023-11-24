/**
 * @file Schedule page
 * @module pages/schedule
 * @see https://nextjs.org/docs/basic-features/pages
 * 
 * Course schedule page where students can build and compare their schedules.
 * Shows a list of bookmarked courses and allows students to construct multiple schedules.
 * Includes estimated workload and time commitment. (IE, in-class hours + out of class hours)
 */

import { getSession, useSession } from "next-auth/react";
import { BrowserView, MobileView } from "../../components/DeviceViews";
import ScheduleCalendar from "../../components/ScheduleCalendar";
import PageTitle from "../../components/common/PageTitle";
import SidebarLayout from "../../layouts/SidebarLayout";
import { CatalogCourse, CustomSession, Schedule, public_course } from "../../lib/common/types";
import { Spacer, useToast } from "@chakra-ui/react";
import { convertTermToFullString } from "../../lib/frontend/utils";
import { getAvailableTermsForSchedulePlanning, getSchedulePlansForSemester, getSchedulePlansForSemesters } from "../../lib/backend/database/schedule";
import { useCallback, useEffect, useReducer, useState } from "react";

import EditScheduleButton from "../../components/common/EditScheduleButton";

import { AddCourseToScheduleModal, DeleteScheduleConfirmation, NewScheduleModal, ScheduleInfoDisplay, ScheduleSidebar } from "../../components/Schedule";
import useScheduleCourses from "../../hooks/useScheduleCourses";
import SelectCourseSectionsModal from "../../components/Schedule/SelectCourseSectionsModal";
import useLocalStorage from "../../hooks/useLocalStorage";

export async function getServerSideProps(context) {

    const session = await getSession(context) as CustomSession;
    const currentTerms = await getAvailableTermsForSchedulePlanning();
    const term = (context.query.term ?? currentTerms[0]) as string;

    const authorized = session?.user?.authorized ?? false;

    const mobileUserAgent = context.req.headers["user-agent"].toLowerCase().includes("mobile");


    // const userBookmarks = await getAllUserBookmarks(session);

    // const bookmarkedCourses = await getAllBookmarksInSemester(session, term);

    const schedules = await getSchedulePlansForSemesters(session, currentTerms);

    return {
        props: {
            term: term,
            currentTerms: currentTerms,

            schedules: JSON.parse(JSON.stringify(schedules)),

            authorized: authorized,
            mobileUserAgent: mobileUserAgent,

        },
    }
}

async function handleCourseScheduleChange(coursesToDrop: CatalogCourse[], coursesToAdd: CatalogCourse[], schedule: Schedule): Promise<CatalogCourse[]> {

    const dropObjs = coursesToDrop.map((course) => ({
        courseID: course.catalogCourseID,
        add: false,
        drop: true,
    }));

    const addObjs = coursesToAdd.map((course) => ({
        courseID: course.catalogCourseID,
        add: true,
        drop: false,
    }));


    const res = await fetch(`/api/schedules`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            schedule: schedule,
            courses: [...dropObjs, ...addObjs]
        })
    });

    const data = await res.json();
    console.log(data);
    return data;




}

async function addCoursesToSchedule(courses: CatalogCourse[], schedule: Schedule): Promise<CatalogCourse[]> {

    const res = await fetch(`/api/schedules`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            schedule: schedule,
            courses: courses.map((course) => ({
                courseID: course.catalogCourseID,
                add: true,
                drop: false,
            }))
        })
    });

    const data = await res.json();
    console.log(data);
    return data;

}



interface ScheduleProps {
    term: string;
    currentTerms: string[];
    schedules: Schedule[];
    authorized: boolean;
    mobileUserAgent: boolean;
}



function Schedule({
    term,
    currentTerms,
    schedules,
    authorized,
    mobileUserAgent,

}: ScheduleProps) {

    const { data: session } = useSession() as { data: CustomSession };

    const [lastScheduleID, setLastScheduleID] = useLocalStorage<string>("lastScheduleID", null);
    const defaultSchedule = schedules?.find((schedule) => schedule.id === Number(lastScheduleID)) ?? null;
    const defaultTerm = defaultSchedule?.semester ?? term;

    const [userTerm, setUserTerm] = useState<string>(defaultTerm);
    const [userSchedules, setUserSchedules] = useState<Schedule[]>(schedules ?? []);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule>(defaultSchedule ?? null);
    const [newScheduleModalOpen, setNewScheduleModalOpen] = useState<boolean>(false);
    const [deleteScheduleModalOpen, setDeleteScheduleModalOpen] = useState<boolean>(false);
    const [addCourseModalOpen, setAddCourseModalOpen] = useState<boolean>(false);
    const [scheduleModifiedRecently, setScheduleModifiedRecently] = useState<boolean>(false); // Used to force a refresh of the schedule courses
    const [courseChangeSectionModalCourseID, setCourseChangeSectionModalCourseID] = useState<string>(null);

    const selectedScheduleCourses = useScheduleCourses(
        selectedSchedule?.id,
        scheduleModifiedRecently,
        setScheduleModifiedRecently
    );

    const scheduleWithCourses = {
        ...selectedSchedule,
        courses: selectedScheduleCourses,
    };

    /* Update LocalStorage when schedules change */
    useEffect(() => {
        if (selectedSchedule) {
            setLastScheduleID(`${selectedSchedule?.id}` ?? "");
        }
    }, [selectedSchedule, setLastScheduleID]);


    /* Update selected schedule when term changes. Try to select the first schedule in the new term. */
    useEffect(() => {

        if (selectedSchedule?.semester === userTerm) {
            return;
        }

        const newSchedule = userSchedules
            .filter((schedule) => schedule.semester === userTerm)
            .sort((a, b) => (a.id > b.id) ? 1 : -1)
            ?.[0] ?? null;
        setSelectedSchedule(newSchedule);
    }, [userTerm, userSchedules, selectedSchedule]);


    const scheduleChangedToast = useToast();



    const handleCourseScheduleChangeWrapper = useCallback(async (coursesToDrop: CatalogCourse[], coursesToAdd: CatalogCourse[], schedule: Schedule) => {
        const newScheduleCourses = await handleCourseScheduleChange(coursesToDrop, coursesToAdd, schedule);
        setScheduleModifiedRecently(true);

        scheduleChangedToast({
            title: "Schedule updated",
            description: "Your schedule has been updated.",
            status: "success",
            duration: 1200,
            isClosable: true,
            position: "bottom"
        });


    }, [scheduleChangedToast]);


    if (!session?.user) {
        return (
            <>
                <PageTitle
                    pageTitle="Schedule Planner"

                />
                <p>You must be logged in to view this page.</p>
            </>
        );
    }



    return (
        <>
            <PageTitle
                pageTitle="Schedule Planner"

            />
            <BrowserView renderDefault={!mobileUserAgent}>
                <SidebarLayout>
                    <SidebarLayout.Sidebar>
                        <ScheduleSidebar
                            setSelectedSchedule={setSelectedSchedule}
                            selectedSchedule={selectedSchedule}
                            userSchedules={userSchedules}
                            scheduleWithCourses={scheduleWithCourses}
                            setNewScheduleModalOpen={setNewScheduleModalOpen}
                            setDeleteScheduleModalOpen={setDeleteScheduleModalOpen}
                            setUserTerm={setUserTerm}
                            userTerm={userTerm}
                            currentTerms={currentTerms}
                            handleCourseScheduleChangeWrapper={handleCourseScheduleChangeWrapper}
                            setCourseChangeSectionModalCourseID={setCourseChangeSectionModalCourseID}
                        />
                    </SidebarLayout.Sidebar>
                    <SidebarLayout.Main>
                        <div style={{
                            display: "flex",
                            flex: "1 3",
                            flexDirection: "column",
                            height: "100%"
                        }}>
                            {/* <div
                                style={{
                                    height: "30%"
                                }}
                            >
                                <ScheduleInfoDisplay catalogEntries={scheduleWithCourses?.courses} />


                            </div> */}
                            <div style={{
                                display: "flex",
                                alignItems: "flex-end",
                                justifyContent: "center",
                                flexGrow: 1,

                            }}>

                                <ScheduleCalendar schedule={scheduleWithCourses} />
                            </div>
                        </div>


                    </SidebarLayout.Main>
                </SidebarLayout>
                <EditScheduleButton
                    onClick={() => setAddCourseModalOpen(true)}
                    schedule={scheduleWithCourses}
                />


            </BrowserView >


            <MobileView renderDefault={mobileUserAgent}>
                {/* <p>The schedule planner requires a larger display</p> */}
                {/* <CourseScheduleInfo
                    courses={scheduleWithCourses?.courses}
                    schedule={scheduleWithCourses}
                    onCourseAdded={handleCourseScheduleChangeWrapper}
                    onChangeSection={(courseID) => setCourseChangeSectionModalCourseID(courseID)}
                /> */}<ScheduleSidebar
                    setSelectedSchedule={setSelectedSchedule}
                    selectedSchedule={selectedSchedule}
                    userSchedules={userSchedules}
                    scheduleWithCourses={scheduleWithCourses}
                    setNewScheduleModalOpen={setNewScheduleModalOpen}
                    setDeleteScheduleModalOpen={setDeleteScheduleModalOpen}
                    setUserTerm={setUserTerm}
                    userTerm={userTerm}
                    currentTerms={currentTerms}
                    handleCourseScheduleChangeWrapper={handleCourseScheduleChangeWrapper}
                    setCourseChangeSectionModalCourseID={setCourseChangeSectionModalCourseID}
                />
                <EditScheduleButton
                    onClick={() => setAddCourseModalOpen(true)}
                    schedule={scheduleWithCourses}
                />

                <Spacer style={{ height: '3rem' }} />
                <ScheduleCalendar schedule={scheduleWithCourses} />


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
                defaultSemester={userTerm}

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
                onCourseAdded={handleCourseScheduleChangeWrapper}
                schedule={scheduleWithCourses}
            />

            <SelectCourseSectionsModal
                isOpen={!!courseChangeSectionModalCourseID}
                onClose={() => setCourseChangeSectionModalCourseID(null)}
                onCourseAdded={handleCourseScheduleChangeWrapper}
                schedule={scheduleWithCourses}
                course={scheduleWithCourses?.courses?.find((course) => course.catalogCourseID === courseChangeSectionModalCourseID)}
            />


        </>

    );


}



export default Schedule;