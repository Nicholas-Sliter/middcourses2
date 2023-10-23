import { CatalogCourse, CatalogCourseWithInstructors, Schedule, public_course } from "../../lib/common/types";
import AddCourseSectionsSelector from "./AddCourseSectionsSelector";

interface SelectCourseSectionsProps {
    schedule: Schedule;
    course: public_course;
    catalogEntries: CatalogCourseWithInstructors[];
    onCourseAdded: (coursesToDrop: CatalogCourse[], coursesToAdd: CatalogCourse[], schedule: Schedule) => void;
    isOpen: boolean;
};


function SelectCourseSectionsModal({
    schedule,
    course,
    catalogEntries,
    onCourseAdded,
    isOpen,
}: SelectCourseSectionsProps) {

    if (!isOpen) {
        return null;
    }

    if (!schedule) {
        return null;
    }




    return (
        <div>
            <p>{course.courseName}</p>
            <AddCourseSectionsSelector
                course={course}
                catalogEntries={catalogEntries}
                onCourseAdded={onCourseAdded}
                schedule={schedule}
            />
        </div>
    );



}

export default SelectCourseSectionsModal;