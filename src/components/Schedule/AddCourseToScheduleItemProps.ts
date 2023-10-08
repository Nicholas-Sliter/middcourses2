import { CatalogCourse, Schedule } from "../../lib/common/types";

interface AddCourseToScheduleItemProps {
    schedule: Schedule;
    onCourseAdded: (course: CatalogCourse, schedule: Schedule) => void;
}

export default AddCourseToScheduleItemProps;