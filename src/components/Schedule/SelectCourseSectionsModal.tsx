import { CatalogCourse, Schedule, public_course } from "../../lib/common/types";

interface SelectCourseSectionsProps {
    schedule: Schedule;
    course: public_course;
    catalogEntries: CatalogCourse[];
    onCourseAdded: (schedule: Schedule, course: CatalogCourse) => void;

};


function SelectCourseSections({
    schedule,
    course,
    catalogEntries,
    onCourseAdded
}: SelectCourseSectionsProps) {



}

export default SelectCourseSections;