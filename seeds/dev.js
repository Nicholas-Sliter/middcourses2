const fs = require("fs");

//chunk size for batch insert
const MAX_TEST_DATA = 100;


const departmentCodeChangedMapping = (code, returnCase = "upper") => {
  let ret = "";
  switch (code.toUpperCase()) {
    case "ENAM": //English & American Literatures => English (2022)
      ret = "ENGL";
      break;
    case "GEOL": //Geology => Earth & Climate Sciences (2022)
      ret = "ECSC";
      break;
    default:
      ret = code;
      break;
  }

  return returnCase === "upper" ? ret.toUpperCase() : ret.toLowerCase();
};

function parseCourseID(courseID) {
  if (!courseID) {
    return { courseNumber: null, department: null };
  }
  try {
    const department = courseID.split(/[0-9]/)[0];
    const courseNumber = courseID.slice(-4);
    return { courseNumber, department };
  } catch (e) {
    return { courseNumber: null, department: null }; //invalid courseID
  }
}


const courseIDChangedMapping = (courseID) => {
  let ret = "";
  const { courseNumber, department } = parseCourseID(courseID);
  ret = (departmentCodeChangedMapping(department) + courseNumber) ?? courseID;
  return ret;
};



exports.seed = async function (knex) {
  //Delete ALL existing table entries
  await knex("User").del();
  await knex("Course").del();
  await knex("Review").del();
  await knex("Flagged").del();
  await knex("Instructor").del();
  await knex("Department").del();
  await knex("CourseInstructor").del();

  //Insert seed entries

  const departments = JSON.parse(
    fs.readFileSync("./data/Department.json", "utf8"));
  await knex.batchInsert("Department", departments, MAX_TEST_DATA);

  //get and print departments
  const depts = await knex("Department").select("*");
  console.log(depts);

  const courseData = JSON.parse(fs.readFileSync("./data/Course.json", "utf8"));
  const courses = courseData.map((course) => {
    return {
      courseID: courseIDChangedMapping(course.courseID),
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      departmentID:
        departmentCodeChangedMapping(course.departmentID ?? course.courseID.slice(0, 4).toUpperCase()),
    };
  });
  //await knex.batchInsert("Course", courses, MAX_TEST_DATA);
  //do upsert
  courses.forEach(async (course) => {
    await knex("Course")
      .insert(course)
      .onConflict("courseID") //upsert
      .merge()
      .returning("*")
      .catch((err) => console.log(err));;
  });


  console.log(await knex("Course").select("courseID"));

  const instructors = JSON.parse(
    fs.readFileSync("./data/Instructor.json", "utf8")
  );
  const fixedInstructors = instructors.map((instructor) => {
    return {
      instructorID: instructor.instructorID,
      name: instructor.name,
      slug: instructor.slug,
      email: instructor.email,
      departmentID: departmentCodeChangedMapping(instructor.departmentID ?? ""),
    };
  });

  await knex.batchInsert("Instructor", fixedInstructors, MAX_TEST_DATA);

  console.log(await knex("Instructor").select("instructorID"));

  const courseInstructors = JSON.parse(
    fs.readFileSync("./data/CourseInstructor.json", "utf8")
  );

  //await knex.batchInsert("CourseInstructor", courseInstructors, MAX_TEST_DATA);
  //much slower, but better error handling
  courseInstructors.forEach(async (courseInstructor) => {
    //check if course id has a dept that needs to be changed
    courseInstructor.courseID = courseIDChangedMapping(courseInstructor.courseID);


    knex("CourseInstructor")
      .insert(courseInstructor)
      .catch((err) => console.log(err));
  });

  const users = JSON.parse(fs.readFileSync("./data/User.json", "utf8"));
  await knex.batchInsert("User", users, MAX_TEST_DATA);

  //TODO: add check to skip this in production, actually add a production seed file
  const reviews = JSON.parse(fs.readFileSync("./data/Review.json", "utf8"));
  await knex.batchInsert("Review", reviews, MAX_TEST_DATA);
};
