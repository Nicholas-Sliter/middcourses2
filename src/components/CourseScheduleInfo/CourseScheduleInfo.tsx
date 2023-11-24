import { MdFindReplace, MdInfoOutline, MdOutlineDelete } from "react-icons/md";
import { CatalogCourse, Schedule } from "../../lib/common/types";
import styles from './CourseScheduleInfo.module.scss';
import { Tooltip } from "@chakra-ui/react";
import Link from "next/link";
import { getLinkFromCourseID } from "../../lib/frontend/utils";

interface CourseScheduleInfoProps {
    courses: CatalogCourse[];
    schedule: Schedule;
    onCourseAdded: (coursesToDrop: CatalogCourse[], coursesToAdd: CatalogCourse[], schedule: Schedule) => void;
    onChangeSection: (courseID: string) => void;
}


function getAbbreviatedCourseType(course: CatalogCourse) {
    const typeMap: Record<string, string> = {
        "Lecture": "Lect",
        "Lab": "Lab",
        "Discussion": "Disc",
        "Fieldwork": "Field",
        "Field": "Field",
        "Screening": "Screen",
        "Seminar": "Sem",
        "Studio": "Studio",
        "Tutorial": "Tut",
        "Other": "Other",
    };

    return typeMap[course.type] ?? "Other";
}



function CourseScheduleInfo({ courses, schedule, onCourseAdded, onChangeSection }: CourseScheduleInfoProps) {

    if (!courses || courses.length === 0) {
        return null;
    }

    /* Group courses by courseID, with primary course as non-lab */
    const groupedCourses = courses
        .sort((a, b) => a.courseName.localeCompare(b.courseName))
        .reduce((acc, course) => {
            const courseID = course.courseID;
            const isLab = course.isLinkedSection;

            if (!acc[courseID]) {
                acc[courseID] = {
                    course,
                    subcourses: [],
                };
            }

            if (isLab) {
                acc[courseID].subcourses.push(course);
            }

            if (!isLab && acc[courseID].course.isLinkedSection) {
                acc[courseID].course = course;
            }

            return acc;

        }, {} as { [courseID: string]: { course: CatalogCourse, subcourses: CatalogCourse[] } });


    return (
        <div className={styles.container}>
            {Object.values(groupedCourses).map(({ course, subcourses }) => {
                return (
                    <div key={course.courseID}>
                        <div className={styles.courseTitle}>
                            <Link passHref href={getLinkFromCourseID(course.courseID)}>
                                <a>{course.courseName}</a>
                            </Link>
                        </div>
                        <div className={styles.subcourseList}>
                            {[course, ...subcourses].map((subcourse) => {
                                return (
                                    <div className={styles.courseLine} key={subcourse.catalogCourseID}>
                                        <div>
                                            <div className={styles.courseType}>{getAbbreviatedCourseType(subcourse)}</div>
                                            <div className={styles.courseIdentifier}>{subcourse.courseID} {subcourse.section}</div>
                                        </div>
                                        {(!subcourse.isLinkedSection) && <span className={styles.courseControls}>
                                            <Tooltip label="Remove course">
                                                <button
                                                    disabled={subcourse.isLinkedSection}
                                                    onClick={() => onCourseAdded([course, ...subcourses], [], schedule)}
                                                >
                                                    <MdOutlineDelete /></button>
                                            </Tooltip>
                                            <Tooltip label="Change sections">
                                                <button
                                                    onClick={() => onChangeSection(subcourse.catalogCourseID)}
                                                ><MdFindReplace /></button>
                                            </Tooltip>
                                            {/* <button><MdInfoOutline /></button> */}
                                        </span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );


            })}
        </div >
    );


}


export default CourseScheduleInfo;