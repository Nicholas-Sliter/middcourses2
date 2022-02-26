import { public_course } from "../common/types";
import { Scraper } from "directory.js";

/* eslint-disable */
export default {};

//test inteface to simulate data from catalog
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

//test interface in order to simulate data from catalog
interface InstructorObject {
    id: string
    name: string
};

//interface to store instructor data in database
interface Instructor {
    name: string;
    slug: string;
    instructorID: string;
    departmentID: string;
};

//extract 
const getInstructorData = async (rawInstructor: InstructorObject) => {

    let formattedInstructor:Instructor;

    formattedInstructor.name = rawInstructor.name;

    formattedInstructor.instructorID = rawInstructor.id;

    //gets person from directory by looking up their id
    const S = new Scraper("", formattedInstructor.instructorID);
    await S.init();
    const department = S.person.department; //this gets department name,  NOT departmentID, but I am using this a placeholder until a name-department ID dictionary can be implemented

    formattedInstructor.departmentID = department;

    return (formattedInstructor);

}

const processInstructors =  (rawInstructors:InstructorObject[]) => {

    //create dictionary to keep track of duplicate instructors
    const instructorDict = {};

    //store processed instructors in an array
    const formattedInstructors:Instructor[] = [];

    rawInstructors.forEach( async (rawInstructor) => {

        const formattedInstructor = await getInstructorData(rawInstructor);

        const ID = formattedInstructor.instructorID;

        if (!instructorDict[ID]){

            instructorDict[ID] = 1;

            formattedInstructors.push(formattedInstructor);

        }

    })

    return(formattedInstructors);

}




