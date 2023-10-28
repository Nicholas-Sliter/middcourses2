import QuickLink from "./BaseQuickLink";
import { FaCalendar } from "react-icons/fa";
import { MdOutlineCalendarViewWeek } from "react-icons/md";

function ScheduleQuickLink() {
    return (
        <QuickLink
            icon={<MdOutlineCalendarViewWeek />}
            title="Schedule Planner"
            description="Build your schedule for next semester."
            href="/schedule"
            available={true}
            isNew
        />
    );

}

export default ScheduleQuickLink;