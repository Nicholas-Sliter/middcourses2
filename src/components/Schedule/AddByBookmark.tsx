import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box } from "@chakra-ui/react";
import useBookmarkedCourses from "../../hooks/useBookmarkedCourses";
import { CatalogCourse } from "../../lib/common/types";
import AddCourseSectionsSelector from "./AddCourseSectionsSelector";
import AddCourseToScheduleItemProps from "./AddCourseToScheduleItemProps";
import styles from "./AddByBookmark.module.scss";

interface AddByBookmarkProps extends AddCourseToScheduleItemProps { };

function AddByBookmark({
    schedule,
    onCourseAdded,
}: AddByBookmarkProps) {
    const semester = schedule.semester;
    const bookmarkedCourses = useBookmarkedCourses(semester);

    return (
        <div>
            {/* <p>Bookmarked Courses</p> */}
            {(Object.keys(bookmarkedCourses).length === 0) && (
                <p>Bookmark a course to see it here</p>
            )}
            <Accordion allowToggle>
                {Object.keys(bookmarkedCourses).map((courseId) => {
                    const course = bookmarkedCourses[courseId];
                    return (
                        <AccordionItem key={courseId}>
                            <h3>
                                <AccordionButton className={styles.accordionButton}>
                                    <span>{courseId} - {course.course.courseName}</span>
                                    <AccordionIcon className={styles.icon} />
                                </AccordionButton>
                            </h3>
                            <AccordionPanel>
                                <div key={courseId}>
                                    <AddCourseSectionsSelector
                                        course={course.course}
                                        catalogEntries={course.catalogEntries}
                                        onCourseAdded={onCourseAdded}
                                        schedule={schedule}
                                    />
                                </div>
                            </AccordionPanel>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div >
    );
}

export default AddByBookmark;