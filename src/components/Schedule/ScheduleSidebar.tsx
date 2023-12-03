import { Select, Tooltip, Button, Spacer } from "@chakra-ui/react";
import { Schedule, CatalogCourse } from "../../lib/common/types";
import { convertTermToFullString } from "../../lib/frontend/utils";
import { MdOutlineDelete, MdOutlineAdd } from "react-icons/md";
import CourseScheduleInfo from "../../components/CourseScheduleInfo";
import styles from './ScheduleSidebar.module.scss';


interface ScheduleSidebarProps {
    setSelectedSchedule: (schedule: Schedule) => void;
    selectedSchedule: Schedule;
    userSchedules: Schedule[];
    scheduleWithCourses: Schedule;
    setNewScheduleModalOpen: (isOpen: boolean) => void;
    setDeleteScheduleModalOpen: (isOpen: boolean) => void;
    setUserTerm: (term: string) => void;
    userTerm: string;
    currentTerms: string[];
    handleCourseScheduleChangeWrapper: (coursesToDrop: CatalogCourse[], coursesToAdd: CatalogCourse[], schedule: Schedule) => void;
    setCourseChangeSectionModalCourseID: (courseID: string) => void;
}



function ScheduleSidebar({
    setSelectedSchedule,
    selectedSchedule,
    userSchedules,
    scheduleWithCourses,
    setNewScheduleModalOpen,
    setDeleteScheduleModalOpen,
    setUserTerm,
    userTerm,
    currentTerms,
    handleCourseScheduleChangeWrapper,
    setCourseChangeSectionModalCourseID
}: ScheduleSidebarProps) {


    const hasCreatedScheduleInTerm = userSchedules
        .filter((schedule) => {
            return (schedule.semester === userTerm)
        }
        ).length > 0;

    const hasAlreadySelectedSchedule = selectedSchedule?.id !== undefined;
    const showCreateScheduleText = !hasCreatedScheduleInTerm && !hasAlreadySelectedSchedule;
    const showSelectScheduleText = hasCreatedScheduleInTerm && !hasAlreadySelectedSchedule;


    const selectSchedulePlaceholder = showCreateScheduleText ? "Create schedule" : showSelectScheduleText ? "Select a schedule" : "";


    return (
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
                        fontSize: '1.5rem',
                        fontWeight: 400,
                        lineHeight: 1.5,
                        color: '#333',
                        marginBottom: 0,
                        width: '100%'
                    }}
                >Schedule</h1>
                <div className={styles.termSelect}>
                    <Select
                        value={userTerm}
                        onChange={(e) => {
                            setUserTerm(e.target.value);
                        }}
                    >
                        {currentTerms.map((term) => {
                            return (
                                <option key={term} value={term}>{convertTermToFullString(term)}</option>
                            )
                        })}
                    </Select>
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    height: "2.5rem",

                    padding: '0.1rem',

                }}
            >
                <Select
                    style={{
                        margin: 0,
                        border: "1px solid #ccc",
                        borderRadius: "0.5rem",
                    }}
                    placeholder={selectSchedulePlaceholder}
                    disabled={showCreateScheduleText}
                    value={selectedSchedule?.id ?? null}
                    onChange={(e) => {
                        setSelectedSchedule(userSchedules.find((schedule) => schedule.id === parseInt(e.target.value)) ?? null);
                    }}
                >
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
                <div className={styles.scheduleControlBar}>
                    <Tooltip label="Delete Schedule">
                        <Button
                            disabled={!selectedSchedule}
                            onClick={() => setDeleteScheduleModalOpen(true)}
                        >

                            <MdOutlineDelete />
                        </Button>
                    </Tooltip>
                    <Tooltip label="Create New Schedule">
                        <Button
                            onClick={() => setNewScheduleModalOpen(true)}
                        >
                            <MdOutlineAdd />
                        </Button>
                    </Tooltip>
                </div>
            </div>
            <Spacer style={{ height: "1rem" }} />
            <CourseScheduleInfo
                courses={scheduleWithCourses?.courses}
                schedule={scheduleWithCourses}
                onCourseAdded={handleCourseScheduleChangeWrapper}
                onChangeSection={(courseID) => setCourseChangeSectionModalCourseID(courseID)}
            />


        </div >
    )
}

export default ScheduleSidebar;