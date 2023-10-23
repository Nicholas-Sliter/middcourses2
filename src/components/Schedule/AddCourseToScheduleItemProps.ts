import { CatalogCourse, Schedule } from "../../lib/common/types";

interface AddCourseToScheduleItemProps {
    schedule: Schedule;
    onCourseAdded: (coursesToDrop: CatalogCourse[], coursesToAdd: CatalogCourse[], schedule: Schedule) => void;
}

export default AddCourseToScheduleItemProps;