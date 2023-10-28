import { CatalogCourse, Schedule } from "../../lib/common/types";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import overrideStyles from './rbcOverride.module.scss';
import styles from './ScheduleCalendar.module.scss';
import dayjs from 'dayjs';
import React from "react";
import Requirement from "catalog.js/lib/classes/Requirement";
import { combind } from "../../lib/frontend/utils";
import ScheduleCalendarEvent from "./ScheduleCalendarEvent";
import Image from "next/image";
import scheduleImage from "/public/images/plan-schedule.svg";

interface ScheduleCalendarProps {
    schedule: Schedule;
}

function getMemoizeDependencies(schedule: Schedule) {
    if (!schedule) {
        return [];
    }

    return [
        /* Semester */
        schedule.semester,
        /* ID */
        schedule.id,
        /* Courses */
        schedule?.courses?.reduce((acc, course) => {
            return acc + course.courseID + course.section;
        }, "") ?? "",
    ];
}

const calendarComponents = {
    event: ScheduleCalendarEvent,
};





function ScheduleCalendar({
    schedule
}: ScheduleCalendarProps) {

    const courses = schedule?.courses ?? [];
    const semester = schedule?.semester;


    if (!semester) {
        return (
            <div className={styles.placeholder} style={{ height: '100%', width: '100%' }}>
                <img className={styles.placeholderImage} src={"/images/plan-schedule.svg"} alt="add a course to get started" />
                <div className={styles.placeholderText}>
                    Get started by creating a new schedule or selecting an existing one
                </div>
            </div>
        );
    }

    /* Return placeholder if no courses */
    if (!schedule?.courses || schedule.courses.length === 0) {
        return (
            <div className={styles.placeholder} style={{ height: '100%', width: '100%' }}>
                <img className={styles.placeholderImage} src={"/images/plan-schedule.svg"} alt="add a course to get started" />
                <div className={styles.placeholderText}>
                    Your schedule is empty, add a course to your schedule to get started
                </div>
            </div>
        );
    }


    const localizer = dayjsLocalizer(dayjs);

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

    const baseMinTime = 8 * 60; /* 8 AM */
    const minActiveTime = Math.min(...courses.map((course) => {
        if (!course.times) {
            return baseMinTime;
        }

        return Object.values(course.times)
            .map(times => times.map(time => time.start))
            .flat();
    })
        .flat(),
        baseMinTime
    );
    const minActiveTimeDate = dayjs().hour(Math.floor(minActiveTime / 60)).minute(minActiveTime % 60).toDate();

    const baseMaxTime = 12 * 60; /* 12 PM */
    const maxActiveTime = Math.max(...courses.map((course) => {
        if (!course.times) {
            return baseMaxTime;
        }

        return Object.values(course.times)
            .map(times => times.map(time => time.end))
            .flat();
    })
        .flat(),
        baseMaxTime
    );
    const maxActiveTimeDate = dayjs().hour(Math.floor(maxActiveTime / 60)).minute(maxActiveTime % 60).toDate();


    const timeRange = maxActiveTime - minActiveTime;

    const events: Array<{
        title: string;
        start: Date;
        end: Date;
        allDay: boolean;
        resource: CatalogCourse;
    }> = courses.map((course) => {
        return Object.values((course?.times ?? {}))
            .map(times => times.map(time => {
                const dayString = time.day.toLowerCase().trim();
                const day = days.indexOf(dayString) + 1;

                return {
                    title: `${course.courseID}-${course.section} \n

                    `,
                    start: dayjs().day(day).hour(Math.floor(time.start / 60)).minute(time.start % 60).toDate(),
                    end: dayjs().day(day).hour(Math.floor(time.end / 60)).minute(time.end % 60).toDate(),
                    allDay: false,
                    resource: course
                };
            }))
            .flat();
    })
        .flat();

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
                events={events}
                getNow={() => { return new Date(0) }}
                date={dayjs().day(days.indexOf("monday")).toDate()}
                onNavigate={() => { }} // Prevents navigation
                components={calendarComponents}




            />
        </>
    );



}



export default React.memo(ScheduleCalendar, (prevProps, nextProps) => {
    return getMemoizeDependencies(prevProps.schedule).join("|") === getMemoizeDependencies(nextProps.schedule).join("|");
}
);
