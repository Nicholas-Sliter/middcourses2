import knex from "./knex";
import { reviewInfo } from "./common";
import { CatalogCourse, CatalogCourseWithInstructors, CustomSession, full_review, public_instructor, public_review, Schedule } from "../../common/types";
import { Knex } from "knex";
import { parseCourseTimeString, checkForTimeConflicts, parseRawCourseID, getCurrentTerm, getNextTerm, sortCoursesByTerm, compareTerm } from "../../common/utils";
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
            type: course.type.text,

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
    if (!session?.user) {
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
    if (!session?.user) {
        return [];
    }

    const schedules = await knex("Plan")
        .where({ userID: session.user.id })
        .andWhere({ semester })
        .select("*");

    return schedules;

};

export async function getSchedulePlansForSemesters(session: CustomSession, semesters: string[]): Promise<Schedule[]> {
    if (!session?.user) {
        return [];
    }

    const schedules = await knex("Plan")
        .where({ userID: session.user.id })
        .whereIn("semester", semesters)
        .select("*");

    return schedules;

};

export async function getAvailableTermsForSchedulePlanning(): Promise<string[]> {


    const upcomingTerms = [getCurrentTerm(), getNextTerm(), getNextTerm(getNextTerm())];

    const terms = await knex("CatalogCourse")
        .select("semester")
        .whereIn("semester", upcomingTerms)
        .distinct();

    return terms.map(term => term.semester).sort(compareTerm);

}


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

    const userCanDelete = await knex("Plan")
        .where({ id })
        .andWhere({ userID: session.user.id })
        .first();

    if (!userCanDelete) {
        return false;
    }

    const clearedCourses = await knex("PlanCourse")
        .where({ planID: id })
        .del();

    const deleted = await knex("Plan")
        .where({ id })
        .del();

    console.log(`Deleted schedule ${id} with ${clearedCourses} courses for user ${session.user.id}`);

    return deleted > 0;
};


export async function removeCoursesFromSchedule(session: CustomSession, scheduleID: string, courses: string[]): Promise<boolean> {

    if (!session?.user) {
        return false;
    }

    if (!courses.length) {
        return false;
    }

    const scheduleCourses = await knex("Plan")
        .where({ id: scheduleID })
        .andWhere({ userID: session.user.id })
        .select("*")
        .leftJoin("PlanCourse", "PlanCourse.planID", "Plan.id");

    const deletedCourses = scheduleCourses
        .map(course => course.catalogCourseID)
        .filter(catalogCourseID => courses.includes(catalogCourseID));

    const deleted = await knex("PlanCourse")
        .where({ planID: scheduleID })
        .whereIn("catalogCourseID", deletedCourses)
        .del();

    return deleted > 0;

};


export async function addCoursesToSchedule(session: CustomSession, scheduleID: string, courses: string[]): Promise<CatalogCourse[]> {

    if (!session?.user) {
        return null;
    }

    if (!courses.length) {
        return null;
    }


    /* Verify scheduleID is associated with user */
    const schedule = await knex("Plan")
        .where({ id: scheduleID })
        .andWhere({ userID: session.user.id })
        .select("*")
        .first();

    if (!schedule) {
        return null; /* Schedule does not exist or user does not have access */
    }

    const resolvedCourses: CatalogCourse[] = await knex("CatalogCourse")
        .whereIn("catalogCourseID", courses)
        .select("*");

    const existingScheduleCourses: CatalogCourse[] = await knex("PlanCourse")
        .where({ planID: scheduleID })
        .leftJoin("CatalogCourse", "CatalogCourse.catalogCourseID", "PlanCourse.catalogCourseID")
        .select("*");

    console.log(`Resolved ${resolvedCourses.length} courses: `, resolvedCourses.map(course => course.catalogCourseID).join(", "));

    if (!resolvedCourses) {
        return null;
    }

    /* Check if courses are already in schedule */
    const alreadyInSchedule = resolvedCourses.filter(course => {
        return existingScheduleCourses.find(existingCourse => existingCourse.catalogCourseID === course.catalogCourseID);
    });

    if (alreadyInSchedule.length > 0) {
        console.log("Course already in schedule")
        return null;
    }


    /* Check if Main course (non-linked) is already in schedule (could be a diff section) */
    const mainCourses = resolvedCourses.filter(course => !course.isLinkedSection);
    const existingMainCourses = existingScheduleCourses.filter(course => !course.isLinkedSection);

    const alreadyInScheduleMain = mainCourses.filter(course => {
        return existingMainCourses.find(existingCourse => existingCourse.courseID === course.courseID);
    });

    if (alreadyInScheduleMain.length > 0) {
        console.log("Main course already in schedule with section");
        return null;
    }


    /* Ensure there are no more than 5 main courses in schedule */
    const totalMainCourses = existingMainCourses.length + mainCourses.length - alreadyInScheduleMain.length;
    if (totalMainCourses > 5) {
        console.log("Too many main courses");
        return null;
    }


    /* Ensure there are no more than 6 linked courses in schedule */
    const linkedCourses = resolvedCourses.filter(course => course.isLinkedSection);
    const existingLinkedCourses = existingScheduleCourses.filter(course => course.isLinkedSection);

    const totalLinkedCourses = existingLinkedCourses.length + linkedCourses.length;
    if (totalLinkedCourses > 6) {
        console.log("Too many linked courses");
        return null;
    }



    /* Make sure courses do not have a time conflict with schedule */
    // const parsedCourseTimes = [...resolvedCourses, ...existingScheduleCourses].flat();
    const courseTimes: Array<CatalogCourse['times']> = [...resolvedCourses, ...existingScheduleCourses].map(course => {
        return course.times
    });

    if (checkForTimeConflicts(courseTimes)) {
        console.log("Time conflict");
        return null;
    }

    /* Insert courses into schedule */
    await knex("PlanCourse")
        .insert(resolvedCourses.map(course => {
            return {
                planID: scheduleID,
                courseID: course.courseID,
                catalogCourseID: course.catalogCourseID,
            };
        }));

    const scheduleCourses = await knex("Plan")
        .where({ id: scheduleID })
        .select("*")
        .leftJoin("PlanCourse", "PlanCourse.planID", "Plan.id")

    // /* Return the schedule */
    // return scheduleCourses.reduce((acc, course) => {
    //     acc[course.catalogCourseID] = true;
    //     return acc;
    // }, {});

    return scheduleCourses;
}

export async function getScheduleCourses(session: CustomSession, planID: string) {

    if (!session?.user) {
        return null;
    }

    if (!planID) {
        return null;
    }

    const scheduleCourses = await knex("Plan")
        .where({ id: planID, userID: session.user.id })
        .select([
            "PlanCourse.courseID",
            "PlanCourse.catalogCourseID",
            "CatalogCourse.crn",
            "CatalogCourse.section",
            "CatalogCourse.isLinkedSection",
            "CatalogCourse.type",
            "CatalogCourse.times",
            "CatalogCourse.instructors",
            "CatalogCourse.requirements",
            "Course.courseName",
            "Course.courseDescription"
        ])
        .leftJoin("PlanCourse", "PlanCourse.planID", "Plan.id")
        .leftJoin("CatalogCourse", "CatalogCourse.catalogCourseID", "PlanCourse.catalogCourseID")
        .leftJoin("Course", "Course.courseID", "PlanCourse.courseID")
        .whereRaw("\"PlanCourse\".\"courseID\" IS NOT NULL");

    if (!scheduleCourses || scheduleCourses.length === 0) {
        return [];
    }

    const instructorIds = scheduleCourses.map(course => course.instructors).flat();
    const instructors = await knex("Instructor")
        .whereIn("instructorID", instructorIds)
        .select([
            "instructorID",
            "slug",
            "name",
            "departmentID"
        ]);

    const instructorMap = instructors.reduce((map, instructor) => {
        map[instructor.instructorID] = instructor;
        return map;
    }, {});

    const res = scheduleCourses.map(course => {
        return {
            ...course,
            instructors: course.instructors.map(instructorID => instructorMap[instructorID]),
        }
    });

    return res;


}


export async function getCatalogCourses(session: CustomSession, semester: string, courseID: string): Promise<CatalogCourseWithInstructors[]> {
    if (!session?.user) {
        return null;
    }

    if (!courseID) {
        return null;
    }

    const scheduleCourses = await knex("CatalogCourse")
        .whereRaw(`"semester" = ? AND "CatalogCourse"."courseID" = ?`, [semester, courseID])
        .select([
            "CatalogCourse.courseID",
            "CatalogCourse.catalogCourseID",
            "CatalogCourse.crn",
            "CatalogCourse.section",
            "CatalogCourse.isLinkedSection",
            "CatalogCourse.type",
            "CatalogCourse.times",
            "CatalogCourse.instructors",
            "CatalogCourse.requirements",
            "Course.courseName",
            "Course.courseDescription"
        ])
        .leftJoin("Course", "Course.courseID", "CatalogCourse.courseID");

    if (!scheduleCourses || scheduleCourses.length === 0) {
        return [];
    }

    const instructorIds = scheduleCourses.map(course => course.instructors).flat();
    const instructors = await knex("Instructor")
        .whereIn("instructorID", instructorIds)
        .select([
            "instructorID",
            "slug",
            "name",
            "departmentID"
        ]);

    const instructorMap = instructors.reduce((map, instructor) => {
        map[instructor.instructorID] = instructor;
        return map;
    }, {});

    const res = scheduleCourses.map(course => {
        return {
            ...course,
            instructors: course.instructors.map(instructorID => instructorMap[instructorID]),
        }
    });

    return res;
}
