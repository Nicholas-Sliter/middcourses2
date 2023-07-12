import { CatalogCourse } from "../../lib/common/types";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import overrideStyles from './rbcOverride.module.scss';
import styles from './ScheduleCalendar.module.scss';
import dayjs from 'dayjs';
import React from "react";
import Requirement from "catalog.js/lib/classes/Requirement";
import { combind } from "../../lib/frontend/utils";

interface ScheduleCalendarProps {
    courses: CatalogCourse[];
    semester: string;
}


function ScheduleCalendar({
    courses,
    semester
}: ScheduleCalendarProps) {

    const localizer = dayjsLocalizer(dayjs);

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const activeDays = courses.map((course) => {
        return [...course.times].map(([key, value]) => value)
            .map(times => times.map(time => time.day))
            .flat();
    })
        .flat();

    const activeDaysSet = new Set(activeDays);

    const baseMinTime = 8 * 60; /* 8 AM */
    const minActiveTime = Math.min(...courses.map((course) => {
        return [...course.times].map(([_, value]) => value)
            .map(times => times.map(time => time.start))
            .flat();
    })
        .flat(),
        baseMinTime
    );
    const minActiveTimeDate = dayjs().hour(Math.floor(minActiveTime / 60)).minute(minActiveTime % 60).toDate();

    const baseMaxTime = 12 * 60; /* 12 PM */
    const maxActiveTime = Math.max(...courses.map((course) => {
        return [...course.times].map(([_, value]) => value)
            .map(times => times.map(time => time.end))
            .flat();
    })
        .flat(),
        baseMaxTime
    );
    const maxActiveTimeDate = dayjs().hour(Math.floor(maxActiveTime / 60)).minute(maxActiveTime % 60).toDate();



    const timeRange = maxActiveTime - minActiveTime;



    return (
        <>
            <Calendar
                className={combind([styles.calendar, overrideStyles.rbcOverride])}
                // style={{ height: '30rem', width: '100%' }}
                style={{ height: '100%', width: '100%' }}
                localizer={localizer}
                defaultView="work_week"
                views={['work_week']}
                formats={{
                    dayFormat: 'ddd',
                    timeGutterFormat: 'ha'
                }}
                toolbar={false}
                tooltipAccessor={null}
                min={minActiveTimeDate}
                max={maxActiveTimeDate}
                events={courses.map((course) => {
                    return [...course.times].map(([key, value]) => value)
                        .map(times => times.map(time => {
                            return {
                                title: `${course.courseName} ${course.crn} ${course.section}`,
                                start: dayjs().day(days.indexOf(time.day) + 1).hour(Math.floor(time.start / 60)).minute(time.start % 60).toDate(),
                                end: dayjs().day(days.indexOf(time.day) + 1).hour(Math.floor(time.end / 60)).minute(time.end % 60).toDate(),
                                allDay: false
                            };
                        }))
                        .flat();
                })
                    .flat()
                }
                getNow={() => { return new Date(0) }}
                date={dayjs().day(days.indexOf("Monday")).toDate()}
                onNavigate={() => { }} // Prevents navigation




            />
        </>
    );



}



export default React.memo(ScheduleCalendar);