import { MdFindReplace, MdInfoOutline, MdOutlineDelete } from "react-icons/md";
import { CatalogCourse } from "../../lib/common/types";
import styles from './CourseScheduleInfo.module.scss';

interface CourseScheduleInfoProps {
    courses: CatalogCourse[];
}

function wordBoundString(str: string) {
    return `\\b${str}\\b`;
}

function getCourseType(course: CatalogCourse) {
    if (course.isLinkedSection) {
        if (course.courseName.toLowerCase().match(wordBoundString("lab"))) return "Lab";
        if (course.courseName.toLowerCase().match(wordBoundString("discussion"))) return "Disc";
        if (course.courseName.toLowerCase().match(wordBoundString("field"))) return "Field";
        if (course.courseName.toLowerCase().match(wordBoundString("fieldwork"))) return "Field";
        return "Other";
    }

    return "Lect"; //Main

}


function CourseScheduleInfo({ courses }: CourseScheduleInfoProps) {

    if (!courses || courses.length === 0) {
        return null;
    }

    /* Group courses by courseID, with primary course as non-lab */
    const groupedCourses = courses.reduce((acc, course) => {
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
                        <div className={styles.courseTitle}>{course.courseName}</div>
                        <div className={styles.subcourseList}>
                            {[course, ...subcourses].map((subcourse) => {
                                return (
                                    <div className={styles.courseLine} key={subcourse.catalogID}>
                                        <div>
                                            <div className={styles.courseType}>{getCourseType(subcourse)}</div>
                                            <div className={styles.courseIdentifier}>{subcourse.courseID} {subcourse.section}</div>
                                        </div>
                                        <span className={styles.courseControls}>
                                            <button><MdOutlineDelete /></button>
                                            <button><MdFindReplace /></button>
                                            <button><MdInfoOutline /></button>
                                        </span>
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