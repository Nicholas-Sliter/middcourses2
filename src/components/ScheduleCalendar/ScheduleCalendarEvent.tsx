import { PopoverArrow, PopoverTrigger, Popover, PopoverContent, Portal, PopoverBody, PopoverHeader, PopoverFooter, PopoverCloseButton, Button } from "@chakra-ui/react";
import { CatalogCourse } from "../../lib/common/types";
import styles from './ScheduleCalendarEvent.module.scss';
import CourseCard from "../common/CourseCard";
import GetCourseWrapper from "../common/GetCourseWrapper";

interface ScheduleCalendarEventProps {
    event: {
        title: string,
        start: Date,
        end: Date,
        resource: CatalogCourse
    }
}


function ScheduleCalendarEventPopupWrapper({ event, children }: ScheduleCalendarEventProps & { children: React.ReactNode }) {

    return (
        <Popover
            // trigger='hover'
            openDelay={300}
            isLazy
            placement='auto'

        >
            <PopoverTrigger>
                {children}
            </PopoverTrigger>
            <Portal>
                <PopoverContent className={styles.popover}>
                    <PopoverArrow />
                    {/* <PopoverHeader>Header</PopoverHeader>
                    <PopoverCloseButton /> */}
                    <PopoverBody>
                        {/* <Button colorScheme='blue'>Button</Button> */}
                        <GetCourseWrapper courseID={event.resource.courseID}>
                            <CourseCard course={null} size="large" />

                            {/* <CourseCard course={null} /> */}

                        </GetCourseWrapper>
                    </PopoverBody>
                    {/* <PopoverFooter>This is the footer</PopoverFooter> */}
                </PopoverContent>
            </Portal>
        </Popover>
    );
}


function ScheduleCalendarEvent({ event }: ScheduleCalendarEventProps) {

    const { title, start, end, resource } = event;

    // console.log(resource);

    // const { courseNumber, department } = parseCourseID(resource.courseID);

    // const course = useCourse(department, courseNumber);

    // console.log(course);

    return (
        <ScheduleCalendarEventPopupWrapper event={event}>
            <div className={styles.eventContainer}>
                {title}
            </div>
        </ScheduleCalendarEventPopupWrapper>


    );


}


export default ScheduleCalendarEvent;

