// import knex from '../lib/backend/database/knex';
// import { createClient } from 'redis';

// const client = createClient({
//     url: process.env.REDIS_URL
// }
// );
// client.on('error', (err) => console.log('Redis Client Error', err));

// async function getDepartmentReviewCounts() {
//     await client.connect();

//     const departmentCounts = await knex('Department')
//         .join('Course', 'Department.departmentID', 'Course.departmentID')
//         .groupBy('Department.departmentID')
//         .join('Review', 'Course.courseID', 'Review.courseID')
//         .where({
//             'Review.deleted': false,
//             'Review.archived': false,
//             'Review.approved': true,
//         })
//         .count('Review.reviewID as reviewCount')
//         .select('Department.departmentID', 'reviewCount');

//     for (const department of departmentCounts) {
//         await client.set(department.departmentID, department.reviewCount);
//     }

// }


// getDepartmentReviewCounts().then(() => {
//     console.log('Department review counts checked successfully');
// }).catch((e) => {
//     console.log(e);
//     console.log('Department review counts check failed');
// }
// ).finally(() => {
//     client.quit();
// });