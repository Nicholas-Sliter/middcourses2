const fs = require("fs");

//chunk size for batch insert
const MAX_TEST_DATA = 100;

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
      courseID: course.courseID,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      departmentID:
        course.departmentID ?? course.courseID.slice(0, 4).toUpperCase(),
    };
  });
  //await knex.batchInsert("Course", courses, MAX_TEST_DATA);
  courses.forEach(async (course) => {
    await knex("Course")
      .insert(course)
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
      departmentID: instructor.departmentID ?? "",
    };
  });

  await knex.batchInsert("Instructor", fixedInstructors, MAX_TEST_DATA);

  console.log(await knex("Instructor").select("instructorID"));

  const courseInstructors = JSON.parse(
    fs.readFileSync("./data/CourseInstructor.json", "utf8")
  );

  //await knex.batchInsert("CourseInstructor", courseInstructors, MAX_TEST_DATA);
  //much slower
  courseInstructors.forEach(async (courseInstructor) => {
    knex("CourseInstructor")
      .insert(courseInstructor)
      .catch((err) => console.log(err));
  });

  const users = JSON.parse(fs.readFileSync("./data/User.json", "utf8"));
  await knex.batchInsert("User", users, MAX_TEST_DATA);

  const reviews = JSON.parse(fs.readFileSync("./data/Review.json", "utf8"));
  await knex.batchInsert("Review", reviews, MAX_TEST_DATA);
};
