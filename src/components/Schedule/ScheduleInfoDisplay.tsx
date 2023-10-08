import useCourses from "../../hooks/useCourses";
import { CatalogCourse, Schedule, public_course } from "../../lib/common/types";

interface ScheduleInfoDisplayProps {
    catalogEntries: CatalogCourse[];
}



const getHoursInClassTime = (catalogEntries: CatalogCourse[], courseID: string) => {
    return catalogEntries.reduce((totalTime, catalogEntry) => {
        if (catalogEntry.courseID !== courseID) {
            return totalTime;
        }
        return totalTime + Object?.values(catalogEntry?.times ?? {}).reduce(
            (acc, timeSet) => { return [...acc, ...timeSet] }, [])
            .reduce((acc, day) => {
                return acc + (day.end - day.start)
            }, 0);
    }, 0) / 60;
}

const getAverageNumericProperty = (courses: public_course[], property: string) => {
    return courses.reduce((acc, course) => {
        return acc + course[property];
    }, 0) / courses.length;
}

const getAverageDifficulty = (courses: public_course[]) => {
    return getAverageNumericProperty(courses, "avgDifficulty");
};

// const getAggregateTopTags


function ScheduleInfoDisplay({
    catalogEntries
}: ScheduleInfoDisplayProps) {

    const courseIDs = new Set(catalogEntries.map(catalogEntry => catalogEntry.courseID));

    const { courses, loading } = useCourses(Array.from(courseIDs));

    const outOfClassHours = courses.reduce((acc, course) => {
        return acc + course.avgHours;
    }, 0);

    const courseHours = Array.from(courseIDs).map(courseID => {
        return {
            courseID,
            hours: getHoursInClassTime(catalogEntries, courseID)
        }
    });

    const totalHours = courseHours.reduce((acc, course) => {
        return acc + course.hours;
    }, 0) + outOfClassHours;




    return (
        <div>
            <h2>Hours</h2>
            <div>
                {!loading ? totalHours.toFixed(1) : ""}
            </div>
            <h2>Difficulty</h2>
            <div>
                {!loading ? getAverageDifficulty(courses).toFixed(1) : ""}
            </div>
        </div>
    );




}


export default ScheduleInfoDisplay;