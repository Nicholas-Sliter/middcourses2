const fs = require('fs');

//chunk size for batch insert
const MAX_TEST_DATA = 100;

exports.seed = async function(knex) {

   // Delete ALL existing table entries
   await knex("User").del();
   await knex("Course").del();
   await knex("Review").del();
   await knex("Instructor").del();
   await knex("Department").del();
   await knex("CourseInstructor").del();

   // Insert seed entries
   const courses = JSON.parse(fs.readFileSync('./data/Course2.json', 'utf8'));
   await knex.batchInsert("Course", courses, MAX_TEST_DATA);

   const instructors = JSON.parse(fs.readFileSync('./data/Instructor.json', 'utf8'));
   await knex.batchInsert("Instructor", instructors, MAX_TEST_DATA);

   const courseInstructors = JSON.parse(fs.readFileSync('./data/CourseInstructor.json', 'utf8'));
   await knex.batchInsert("CourseInstructor", courseInstructors, MAX_TEST_DATA);

   const departments = JSON.parse(fs.readFileSync('./data/Department.json', 'utf8'));
   await knex.batchInsert("Department", departments, MAX_TEST_DATA);

   const users = JSON.parse(fs.readFileSync('./data/User.json', 'utf8'));
   await knex.batchInsert("User", users, MAX_TEST_DATA);

   const reviews = JSON.parse(fs.readFileSync('./data/Review.json', 'utf8'));
   await knex.batchInsert("Review", reviews, MAX_TEST_DATA);


};