import knex from "./knex";
import { reviewInfo } from "./common";
import { CustomSession, full_review, public_instructor, public_review, schedule } from "../../common/types";
import { Knex } from "knex";
import { parseCourseTimeString, checkForTimeConflicts, parseRawCourseID } from "../../common/utils";
import Course from "catalog.js/lib/classes/Course.js";
import Meeting from "catalog.js/lib/classes/Meeting";



export async function removeSemester(semester: string) {

    await knex("Plan")
        .where({ semester })
        .del();

    await knex("PlanCourses")
        .where({ semester })
        .del();

}

function isLinkedCourse(courseType: string) {
    return ["Lab", "Discussion"].includes(courseType ?? "");
}


function parseCourseMeetingTimes(meetings: Meeting[]) {
    const meetingTimes = meetings.map(meeting => {
        return parseCourseTimeString(meeting.raw);
    });

    console.log(meetingTimes);

    return meetingTimes;
}


function filterAcceptedRequirementList(requirements: string[]) {

    const ACCEPTED_REQUIREMENTS = new Set([
        /*  Distribution Requirement: Academic Categories */
        "ART", "PHL", "HIS",
        "SCI", "DED", "SOC",
        "LNG",

        /* Distribution Requirement: Culture/Civilizations */
        "SOA", "NOA", "EUR",
        "MDE", "SAF", "AMR",
        "CMP",

        /* Distribution Requirement: College Writing */
        "CW",

        /* Distribution Requirement: Winter Term Requirement */
        "WTR",
    ]);

    return (requirements ?? [])
        .filter(requirement => ACCEPTED_REQUIREMENTS.has(requirement));

}


export async function upsertCatalogCourses(rawCatalogCourses: Course[], semester: string) {

    const courseIDs = await knex('CourseInstructor')
        .where({ "term": semester })
        .select("courseID")
        .distinct();
    const courseIDSet = new Set(courseIDs.map(course => course.courseID));

    /* Link catalog courses to our internal course IDs */
    const catalogCourses = rawCatalogCourses.map(course => {
        // const { code, section, term } = parseRawCourseID(course.courseNumber);
        // if (term !== semester || !code || !section || !courseIDSet.has(course.courseNumber)) {
        //     return null;
        // }

        if (!courseIDSet.has(course.courseNumber)) {
            return null;
        }

        return {
            ...course,
            courseID: course.courseNumber
        };
    });

    /* Construct final objects to be inserted into the database */
    const catalogCoursesToInsert = catalogCourses.map(course => {
        if (!course) {
            return null;
        }

        return {
            catalogCourseID: course.code,
            crn: course.crn,
            semester: semester,

            courseID: course.courseID,

            section: parseRawCourseID(course.code)?.section,
            isLinkedSection: isLinkedCourse(course?.type?.text),


            instructors: course.instructors.map(instructor => instructor.middleburyID),
            requirements: filterAcceptedRequirementList(course.requirements.map(requirement => requirement.text)),

            times: parseCourseMeetingTimes(course.schedule.meetings),

        };
    });


    /* Insert into database */
    await knex("CatalogCourse")
        .insert(catalogCoursesToInsert)
        .onConflict(["catalogCourseID", "crn", "semester"])
        .merge();

}



export async function getSchedulePlan(session: CustomSession, id: number): Promise<schedule> {
    if (!session.user) {
        return null;
    }


    const schedule = await knex("Plan")
        .where({ id })
        .andWhere({ userID: session.user.id })
        .select("*")
        .first();

    return schedule;

};


export async function getSchedulePlansForSemester(session: CustomSession, semester: string): Promise<schedule[]> {
    if (!session.user) {
        return [];
    }

    const schedules = await knex("Plan")
        .where({ userID: session.user.id })
        .andWhere({ semester })
        .select("*");

    return schedules;

};


export async function createPlan(session: CustomSession, semester: string): Promise<schedule> {
    if (!session.user) {
        return null;
    }

    const [id] = await knex("Plan")
        .insert({
            userID: session.user.id,
            semester
        });

    return await getSchedulePlan(session, id);

};


export async function deletePlan(session: CustomSession, id: number): Promise<boolean> {
    if (!session.user) {
        return false;
    }

    const deleted = await knex("Plan")
        .where({ id })
        .andWhere({ userID: session.user.id })
        .del();

    return deleted > 0;
};


export async function removeCoursesFromSchedule(session: CustomSession, scheduleID: string, courses: string[]): Promise<boolean> {

    const scheduleCourses = await knex("Plan")
        .where({ id: scheduleID })
        .andWhere({ userID: session.user.id })
        .select("*")
        .leftJoin("PlanCourses", "PlanCourses.planID", "Plan.id")
        .whereIn("PlanCourses.courseID", courses);

    const deletedCourses = scheduleCourses.map(course => course.courseID);

    const deleted = await knex("PlanCourses")
        .where({ planID: scheduleID })
        .whereIn("courseID", deletedCourses)
        .del();

    return deleted > 0;

};


export async function addCoursesToSchedule(session: CustomSession, scheduleID: string, courses: string[]): Promise<Record<string, boolean>> {

    /* Verify scheduleID is associated with user */
    const schedule = await knex("Plan")
        .where({ id: scheduleID })
        .andWhere({ userID: session.user.id })
        .select("*")
        .first();

    if (!schedule) {
        return null; /* Schedule does not exist or user does not have access */
    }

    const resolvedCourses = await knex("CatalogCourses")
        .whereIn("id", courses)
        .select("*");

    /* Make sure courses do not have a time conflict with schedule */
    const parsedCourseTimes = resolvedCourses.map(course => parseCourseTimeString(course.time)).flat();
    if (checkForTimeConflicts(parsedCourseTimes)) {
        return null;
    }

    /* Insert courses into schedule */
    await knex("PlanCourses")
        .insert(resolvedCourses.map(course => {
            return {
                planID: scheduleID,
                courseID: course.id
            };
        }))
        .onConflict(["planID", "courseID"])
        .merge();

    const scheduleCourses = await knex("Plan")
        .where({ id: scheduleID })
        .select("*")
        .leftJoin("PlanCourses", "PlanCourses.planID", "Plan.id")

    /* Return the schedule */
    return scheduleCourses.reduce((acc, course) => {
        acc[course.catalogCourseID] = true;
        return acc;
    }, {});
}