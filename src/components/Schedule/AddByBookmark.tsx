import useBookmarkedCourses from "../../hooks/useBookmarkedCourses";
import { CatalogCourse } from "../../lib/common/types";
import AddCourseToScheduleItemProps from "./AddCourseToScheduleItemProps";

interface AddByBookmarkProps extends AddCourseToScheduleItemProps { };

function AddByBookmark({
    schedule,
    onCourseAdded,
}: AddByBookmarkProps) {
    const semester = schedule.semester;
    const bookmarkedCourses = useBookmarkedCourses(semester);

    return (
        <div>
            <p>Bookmark</p>
            {Object.keys(bookmarkedCourses).map((courseId) => {
                const course = bookmarkedCourses[courseId];
                return (
                    <div key={courseId}>
                        <p>{courseId}</p>
                        <p>{course.course.courseName}</p>
                        <button onClick={() => onCourseAdded({ catalogCourseID: course.catalogEntries[0].catalogCourseID } as unknown as CatalogCourse, schedule)}>Add CSCI 1200</button>

                    </div>
                );
            })}
        </div>
    );
}

export default AddByBookmark;