import { MdFindReplace, MdInfoOutline, MdOutlineDelete } from "react-icons/md";
import { CatalogCourse } from "../../lib/common/types";
import styles from './CourseScheduleInfo.module.scss';

interface CourseScheduleInfoProps {
    courses: CatalogCourse[];
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
                                    <div className={styles.courseLine} key={subcourse.catalogCourseID}>
                                        <div>
                                            <div className={styles.courseType}>{getAbbreviatedCourseType(subcourse)}</div>
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