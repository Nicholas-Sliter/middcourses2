import { CustomSession, public_course } from "../common/types";
import { getCurrentTerm, getNextTerm } from "../common/utils";
import { getCourseIDByTerms, getCoursesInformation } from "./database/course";
import {
    getBaseCourseAverages, getChallengingCourses, getEasiestGoodCourses,
    getLowTimeCommitmentCourses, getTopEasyAndValuableCourses, getTopRatedCourses,
    getNecessaryCourses, getLearnALotCourses, getTopMajorCourses, getUserMajorMinors, getTopMinorCourses, bestInterdepartmentalCourses, getTopUpcomingCourses
} from "./database/rankings";
import { getRecommendationsForUser } from "./recommendations";


interface CourseRankingMap {
    [key: string]: {
        func: (aggregateData: any, limit: number, session?: CustomSession, data?: any) => string[],
        data?: any,
        params: {
            limit: number
        },
        title: string,
        description: string,
        type: "course" | "instructor" | "department",
        personalized?: boolean,
        size?: "normal" | "large",
        message?: string,
        error?: boolean
    }
}

async function getCourseRankings(session?: CustomSession) {

    let userMajorMinors: [string, string][] = [];
    if (session && session.user.id && session.user.role === "student") {
        userMajorMinors = await getUserMajorMinors(session);
    }

    const userMajors = userMajorMinors.filter((majorMinor) => majorMinor[1] === "major").map((majorMinor) => majorMinor[0]);
    const userMinors = userMajorMinors.filter((majorMinor) => majorMinor[1] === "minor").map((majorMinor) => majorMinor[0]);

    const currentSemester = getCurrentTerm();
    const nextSemester = getNextTerm();
    const nextSemesterCourses = await getCourseIDByTerms([nextSemester, currentSemester]);

    const userRecommendationObject = await getRecommendationsForUser(
        session,
        25,
        0,
        10000
    );

    const recsAsHeroCards = userRecommendationObject.courses.length > 0 && !userRecommendationObject.error;

    const recommendationTypeMap: CourseRankingMap = {
        "topRated": {
            func: getTopRatedCourses,
            params: {
                limit: 25
            },
            title: "Top Rated",
            description: "Top rated courses",
            type: "course",
            personalized: false,
            size: (!recsAsHeroCards ? "large" : "normal")
        },
        "upcoming": {
            func: getTopUpcomingCourses,
            data: nextSemesterCourses,
            params: {
                limit: 15
            },
            title: "Upcoming",
            description: "Top rated courses in the current & upcoming semesters",
            type: "course",
            personalized: true // This is a lie
        },
        "topCoursesInYourMajors": {
            func: getTopMajorCourses,
            data: userMajorMinors,
            params: {
                limit: 15
            },
            title: "Top Courses in Your Major" + (userMajors.length > 1 ? "s" : ""),
            description: "Top rated courses in your major" + (userMajors.length > 1 ? "s" : ""),
            type: "course",
            personalized: true
        },
        "topCoursesInYourMinors": {
            func: getTopMinorCourses,
            data: userMajorMinors,
            params: {
                limit: 15
            },
            title: "Top Courses in Your Minor" + (userMinors.length > 1 ? "s" : ""),
            description: "Top rated courses in your minor" + (userMinors.length > 1 ? "s" : ""),
            type: "course",
            personalized: true
        },
        "mustTake": {
            func: getNecessaryCourses,
            params: {
                limit: 15
            },
            title: "Must Take",
            description: "Top rated courses by value-gained",
            type: "course",
            personalized: false
        },
        "easyValuable": {
            func: getTopEasyAndValuableCourses,
            params: {
                limit: 10
            },
            title: "Easy and Valuable",
            description: "Courses that are easy and valuable",
            type: "course",
            personalized: false
        },
        "learnALot": {
            func: getLearnALotCourses,
            params: {
                limit: 10
            },
            title: "Learn a lot",
            description: "Courses that are good for learning a lot",
            type: "course",
            personalized: false
        },
        "goodForAChallenge": {
            func: getChallengingCourses,
            params: {
                limit: 10
            },
            title: "Good for a challenge",
            description: "Courses that are good for a challenge",
            type: "course",
            personalized: false
        },
        "interdepartmental": {
            func: bestInterdepartmentalCourses,
            params: {
                limit: 10
            },
            title: "Interdepartmental",
            description: "Best courses that are interdepartmental",
            type: "course",
            personalized: false
        },
        "easy": {
            func: getEasiestGoodCourses,
            params: {
                limit: 10
            },
            title: "Nice for a break",
            description: "Courses that are easy",
            type: "course",
            personalized: false
        },
        "lowTimeCommitment": {
            func: getLowTimeCommitmentCourses,
            params: {
                limit: 10
            },
            title: "Low Time Commitment",
            description: "Courses that are low time commitment",
            type: "course",
            personalized: false
        },

    };

    const threshold = 3;

    const aggregateData = await getBaseCourseAverages(threshold);

    const rankedCourses = Object.fromEntries(Object.keys(recommendationTypeMap).map((key) => ([key, {
        courses: [],
        title: recommendationTypeMap[key].title,
        description: recommendationTypeMap[key].description,
        displaySize: recommendationTypeMap?.[key]?.size || "normal",
        message: recommendationTypeMap?.[key]?.message || "",
        error: false
    }])));

    rankedCourses["recommendations"] = {
        courses: [],
        title: "Courses you might like",
        description: "Personalized course recommendations for you",
        displaySize: "normal",
        message: userRecommendationObject?.message || "",
        error: userRecommendationObject?.error
    };

    const courses = new Set([]);


    for (const [key, value] of Object.entries(recommendationTypeMap)) {
        // const recs = value.func(aggregateData, value.params.limit);
        let recs: string[] = [];
        if (value.personalized && session) {
            recs = value.func(aggregateData, value.params.limit, session, value.data);
        } else {
            recs = value.func(aggregateData, value.params.limit, undefined, value.data);
        }
        recs.forEach((courseID, index) => {
            courses.add(courseID);
            rankedCourses[key].courses.push({ courseID, index });
        });
    }

    if (userRecommendationObject && !userRecommendationObject.error) {
        for (const courseID of userRecommendationObject.courses) {
            courses.add(courseID);
            rankedCourses["recommendations"].courses.push({ courseID, index: 0 });
        }
    }

    const courseInfo = await getCoursesInformation(Array.from(courses));
    const courseInfoMap = new Map(courseInfo.map((course) => [course.courseID, course]));

    /* Add additional information from aggregate */
    aggregateData.forEach((course) => {
        if (!courseInfoMap.has(course.courseID)) {
            return;
        }
        const info = courseInfoMap.get(course.courseID);
        info.numReviews = course.numReviews;
        info.avgRating = course.avgRating;
        info.avgDifficulty = course.avgDifficulty;
        info.avgHours = course.avgHours;
        info.avgValue = course.avgValue;
        info.avgAgain = course.avgAgain;
    });


    Object.entries(rankedCourses).forEach(([key, value]) => {
        value.courses = value.courses.map((course) => ({
            ...course,
            ...courseInfoMap.get(course.courseID),
        })) as public_course[];
    });

    const filteredRankings = Object.fromEntries(Object.entries(rankedCourses).filter(([key, value]) => (value.courses.length > 0 || key === "recommendations")));

    return filteredRankings;
}

export default getCourseRankings;