import knex from "./knex";
import { reviewInfo } from "./common";
import { CustomSession, full_review, public_instructor, public_review, Schedule } from "../../common/types";
import { Knex } from "knex";
import { parseCourseTimeString, checkForTimeConflicts, parseRawCourseID } from "../../common/utils";
import Course from "catalog.js/lib/classes/Course.js";
import Meeting from "catalog.js/lib/classes/Meeting";


const MAX_USER_SCHEDULES = 12;

const ACCEPTED_REQUIREMENTS = new Set([
    /*  Distribution Requirement: Academic Categories */
    "ART", "PHL", "HIS",
    "SCI", "DED", "SOC",
    "LNG", "LIT",

    /* Distribution Requirement: Culture/Civilizations */
    "SOA", "NOA", "EUR",
    "MDE", "SAF", "AMR",
    "CMP",

    /* Distribution Requirement: College Writing */
    "CW",

    /* Distribution Requirement: Winter Term Requirement */
    "WTR",
]);


const REQ_MAP = {
    /* Distribution Requirement: Academic Categories */
    "ART": "The Arts",
    "PHL": "Philosophical and Religious Studies",
    "HIS": "Historical Studies",
    "SCI": "Physical and Life Sciences",
    "DED": "Deductive Reasoning and Analytical Processes",
    "SOC": "Social Analysis",
    "LNG": "Forign Language",
    "LIT": "Literature",

    /* Distribution Requirement: Culture/Civilizations */
    "SOA": "South and Southeast Asia Civilization Requirement",
    "NOA": "North Asia Civilization Requirement",
    "EUR": "European Civilization Requirement",
    "MDE": "Middle East and North Africa Civilization Requirement",
    "SAF": "Sub-Saharan Africa Civilization Requirement",
    "AMR": "America Civilization Requirement",
    "CMP": "Comparative Requirement",

    /* Distribution Requirement: College Writing */
    "CW": "College Writing",

    /* Distribution Requirement: Winter Term Requirement */
    "WTR": "Winter Term Requirement",

};


const REVERSED_REQ_MAP = {};
Object.entries(REQ_MAP).forEach(([key, value]) => {
    REVERSED_REQ_MAP[value] = key;
});


export async function removeSemester(semester: string) {

    await knex("Plan")
        .where({ semester })
        .del();

}

export async function removeOldPlans(validSemesters: string[]) {

    await knex("Plan")
        .whereNotIn("semester", validSemesters)
        .del();

}


export async function removeOldCatalogCourses(validSemesters: string[]) {

    await knex("CatalogCourse")
        .whereNotIn("semester", validSemesters)
        .del();

}


function isLinkedCourse(courseType: string) {
    return [
        "Lab",
        "Discussion",
        "Screening"
    ].includes(courseType ?? "");
}


function parseCourseMeetingTimes(meetings: Meeting[]) {
    const meetingTimes = meetings.map(meeting => {
        return parseCourseTimeString(meeting.raw);
    });

    /* Convert to JSON string to store in database */
    const meetingTimesJSON = {};
    meetingTimes.forEach((meeting, index) => {
        meetingTimesJSON[index] = meeting;
    });

    return JSON.stringify(meetingTimesJSON);
}


function filterAcceptedRequirementList(requirements: string[]) {

    const filteredReqs = (requirements ?? [])
        .filter(requirement => REQ_MAP[requirement] !== undefined || REVERSED_REQ_MAP[requirement] !== undefined)
        .map(requirement => REVERSED_REQ_MAP[requirement] ?? requirement);

    return filteredReqs;
}


export async function upsertCatalogCourses(transaction: Knex.Transaction, rawCatalogCourses: Course[], semester: string) {

    const courseIDs = await transaction('CourseInstructor')
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

        // console.log(`Processing course ${course.code} ${course.crn.text} ${course.type.text} ${course.courseID} Section:${parseRawCourseID(course.code)?.section}`);

        return {
            catalogCourseID: course.code,
            crn: course.crn.text,
            semester: semester,

            courseID: course.courseID,

            section: parseRawCourseID(course.code)?.section,
            isLinkedSection: isLinkedCourse(course?.type?.text),


            instructors: course.instructors.map(instructor => instructor.id),
            requirements: filterAcceptedRequirementList(course.requirements.map(requirement => requirement.text)),

            times: parseCourseMeetingTimes(course.schedule.meetings),

        };
    });

    /* Remove null values */
    const nonNullCourses = catalogCoursesToInsert.filter(course => course !== null);


    console.log(`Inserting ${nonNullCourses.length} catalog courses`)

    /* Insert into database */
    const res: any = await transaction("CatalogCourse")
        .insert(nonNullCourses)
        .onConflict("catalogCourseID")
        .merge();

    console.log(`Sucessfully inserted ${res.rowCount} catalog courses`);
}



export async function getSchedulePlan(session: CustomSession, id: number): Promise<Schedule> {
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


export async function getSchedulePlansForSemester(session: CustomSession, semester: string): Promise<Schedule[]> {
    if (!session.user) {
        return [];
    }

    const schedules = await knex("Plan")
        .where({ userID: session.user.id })
        .andWhere({ semester })
        .select("*");

    return schedules;

};

export async function getSchedulePlansForSemesters(session: CustomSession, semesters: string[]): Promise<Schedule[]> {
    if (!session.user) {
        return [];
    }

    const schedules = await knex("Plan")
        .where({ userID: session.user.id })
        .whereIn("semester", semesters)
        .select("*");

    return schedules;

};


export async function createPlan(session: CustomSession, schedule: Omit<Schedule, "id">): Promise<Schedule> {
    if (!session?.user) {
        return Promise.reject("User not logged in");
    }

    const userSchedules = await knex("Plan")
        .where({ userID: session.user.id });

    if (userSchedules.length >= MAX_USER_SCHEDULES) {
        console.log(`User ${session.user.id} has reached the maximum number of schedules (${MAX_USER_SCHEDULES})`);
        return Promise.reject("Maximum number of schedules reached");
    }

    /* Name uniqueness check */
    const userScheduleNames = userSchedules
        .filter(sch => sch.semester === schedule.semester)
        .map(sch => sch.name);


    if (userScheduleNames.includes(schedule.name)) {
        console.log(`User ${session.user.id} already has a schedule named '${schedule.name}'`);
        return Promise.reject("Schedule name already exists");
    }

    const [id] = await knex("Plan")
        .insert({
            userID: session.user.id,
            semester: schedule.semester,
            name: schedule.name,
        })
        .returning("id");

    console.log(`Created schedule ${id} for user ${session.user.id}`);

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

    console.log(`Deleted schedule ${id} for user ${session.user.id}`);
    console.log(`Deleted ${deleted} rows`);

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