import React from "react";
import useCourse from "../../hooks/useCourse";
import { parseCourseID } from "../../lib/common/utils";

interface GetCourseWrapperProps {
    courseID: string;
    children: React.ReactNode;
}

function GetCourseWrapper({ courseID, children }: GetCourseWrapperProps) {

    const { courseNumber, department } = parseCourseID(courseID);

    const course = useCourse(department, courseNumber);

    return (
        <>
            {children && React.Children.map(children, (child) => {
                return React.cloneElement(child as React.ReactElement, { course });
            }
            )}
        </>
    );
}

export default GetCourseWrapper;