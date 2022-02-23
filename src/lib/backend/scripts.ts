import { public_course } from "../common/types";

/* eslint-disable */
export default {};

interface CourseObject {
    code: string;
    description: string;
    title: string;
};


//get course data from course object 
const getCourseData = (rawCourse: CourseObject) => {


    let formattedCourse: public_course;

    //extract description
    formattedCourse.courseDescription = rawCourse.description;

    //extract title
    formattedCourse.courseName = rawCourse.title;

    //extract courseID
    formattedCourse.courseID = rawCourse.code.substring(0,7);

    return (formattedCourse);


}

    
//return array of processed course objects after stripping out sections
const processCourses = (rawCourses:CourseObject[]) => {

    //create a dictionary to keep track of duplicate courses
    const courseDict = {};

    //initialize array of formatted courses
    const formattedCourses: public_course[] = [];

    rawCourses.forEach( (rawCourse) => {

        let formattedCourse = getCourseData(rawCourse);
        let name = formattedCourse.courseID;

        if (!courseDict[name]) {

            courseDict[name] = 1;

            formattedCourses.push(formattedCourse);
        }

    })

    return (formattedCourses);


}




