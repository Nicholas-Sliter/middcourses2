const fs = require('fs');

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
   const courses = JSON.parse(fs.readFileSync('../data/Course.json', 'utf8'));
   await knex("Course").batchInsert(courses, MAX_TEST_DATA);

   const instructors = JSON.parse(fs.readFileSync('../data/Instructor.json', 'utf8'));
   await knex("Instructor").batchInsert(instructors, MAX_TEST_DATA);

   const courseInstructors = JSON.parse(fs.readFileSync('../data/CourseInstructor.json', 'utf8'));
   await knex("CourseInstructor").batchInsert(courseInstructors, MAX_TEST_DATA);

   const departments = JSON.parse(fs.readFileSync('../data/Department.json', 'utf8'));
   await knex("Department").batchInsert(departments, MAX_TEST_DATA);

   const users = JSON.parse(fs.readFileSync('../data/User.json', 'utf8'));
   await knex("User").batchInsert(users, MAX_TEST_DATA);

   const reviews = JSON.parse(fs.readFileSync('../data/Review.json', 'utf8'));
   await knex("Review").batchInsert(reviews, MAX_TEST_DATA);


};