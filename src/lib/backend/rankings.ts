import { public_course } from "../common/types";
import { getCoursesInformation } from "./database/course";
import { getBaseCourseAverages, getChallengingCourses, getEasiestGoodCourses, getLowTimeCommitmentCourses, getTopEasyAndValuableCourses, getTopRatedCourses } from "./database/rankings";

async function getCourseRankings() {
    const recommendationTypeMap = {
        "easyValuable": {
            func: getTopEasyAndValuableCourses,
            params: {
                limit: 10
            },
            title: "Easy and Valuable",
            description: "Courses that are easy and valuable",
            type: "course"
        },
        "easy": {
            func: getEasiestGoodCourses,
            params: {
                limit: 10
            },
            title: "Nice for a break",
            description: "Courses that are easy",
            type: "course"
        },
        "lowTimeCommitment": {
            func: getLowTimeCommitmentCourses,
            params: {
                limit: 10
            },
            title: "Low Time Commitment",
            description: "Courses that are low time commitment",
            type: "course"
        },
        "goodForAChallenge": {
            func: getChallengingCourses,
            params: {
                limit: 10
            },
            title: "Good for a challenge",
            description: "Courses that are good for a challenge",
            type: "course"
        },
        "topRated": {
            func: getTopRatedCourses,
            params: {
                limit: 10
            },
            title: "Top Rated",
            description: "Top rated courses",
            type: "course"
        }

    };

    const threshold = 5;

    const aggregateData = await getBaseCourseAverages(threshold);
    const rankedCourses = Object.fromEntries(Object.keys(recommendationTypeMap).map((key) => ([key, {
        courses: [],
        title: recommendationTypeMap[key].title,
        description: recommendationTypeMap[key].description,
    }])));
    const courses = new Set([]);


    for (const [key, value] of Object.entries(recommendationTypeMap)) {
        const recs = value.func(aggregateData, value.params.limit);
        recs.forEach((courseID, index) => {
            courses.add(courseID);
            rankedCourses[key].courses.push({ courseID, index });
        });
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
    });


    Object.entries(rankedCourses).forEach(([key, value]) => {
        value.courses = value.courses.map((course) => ({
            ...course,
            ...courseInfoMap.get(course.courseID),
        })) as public_course[];
    });

    return rankedCourses;
}

export default getCourseRankings;