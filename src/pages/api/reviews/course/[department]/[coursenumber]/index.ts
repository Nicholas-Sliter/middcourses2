import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import {
  addReview,
  checkIfCourseExistsByInstructorAndSemester,
  checkReviewByUserAndCourse,
  getCourseByID,
  getReviewsByCourseID,
} from "../../../../../../lib/backend/database-utils";
import { getSession } from "next-auth/react";
import {
  canWriteReviews,
  containsProfanity,
  uuidv4,
} from "../../../../../../lib/backend/utils";
import { exists } from "fs";

/**
 * Get all course reviews for a specific course
 * GET: returns a list of all reviews for a specific course
 */
const handler = nc({
  onError: (err, req: NextApiRequest, res: NextApiResponse) => {
    console.log(err.stack);
    res.status(500).end("Something went wrong");
  },
  onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
    res.status(404).end("Not Found");
  },
})
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const session = (await getSession({ req })) as any;

    if (!session) {
      return res
        .status(401)
        .end("Unauthorized: You must be logged in to view this page");
    }

    if (!session.user.authorized) {
      return res.status(403).end("You must submit 2 reviews to view this page");
    }

    const department = req.query.department as string;
    const courseNumber = req.query.coursenumber as string;
    //changed to lowercase query term as uppercase characters cause issues on macs

    const courseID = `${department.toUpperCase()}${courseNumber.trim()}`;

    if (!courseID || !department || !courseNumber) {
      res.status(400).end("Invalid course id");
    }

    //pattern to match course number is 4 digits
    if (!/^[0-9]{4}$/.test(courseNumber)) {
      res.status(400).end("Invalid course number");
    }

    //pattern to match department is 4 letters
    if (!/^[a-zA-Z]{4}$/.test(department)) {
      res.status(400).end("Invalid department");
    }

    const reviews = await getReviewsByCourseID(courseID);

    if (!reviews) {
      res.status(404).end("Reviews not found for this course");
    }

    res.status(200).json({
      courseID: courseID,
      reviews: reviews,
    });
  })
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    //submit a review for a course

    const session = (await getSession({ req })) as any;

    console.log(req.body);

    if (!session) {
      return res
        .status(401)
        .end("Unauthorized: You must be logged in to submit a review");
    }

    if (session.user.type === "faculty" || !canWriteReviews(session.user.id)) {
      return res.status(403).end("You cannot submit a review for courses");
    }

    const department = req.query.department as string;
    const courseNumber = req.query.coursenumber as string;
    const courseID = `${department.toUpperCase()}${courseNumber.trim()}`;

    //match course id of endpoint to course id in request body
    if (courseID !== req.body.courseID) {
      return res
        .status(400)
        .end("Endpoint course id does not match course id in request body");
    }

    //check if course id is valid
    if (!courseID || !req.body.courseID || getCourseByID(courseID) === null) {
      return res.status(400).end("Invalid course id");
    }

    if (checkReviewByUserAndCourse(session.user.id, courseID)) {
      return res
        .status(403)
        .end("You have already submitted a review for this course");
    }

    //check semester and instructor
    if (!req.body.semester || !req.body.instructor) {
      return res.status(400).end("Invalid semester or instructor");
    }

    if (
      !checkIfCourseExistsByInstructorAndSemester(
        courseID,
        req.body.instructor,
        req.body.semester
      )
    ) {
      return res.status(400).end("Invalid semester or instructor");
    }

    //check if review is valid
    if (
      !req.body.content ||
      req.body.content.length > 1000 ||
      req.body.content.length < 200
    ) {
      return res.status(400).end("Invalid review length");
    }

    if (containsProfanity(req.body.content)) {
      return res.status(400).end("Review contains profanity");
    }

    const review = {
      reviewID: uuidv4(),
      reviewerID: session.user.id,
      courseID: courseID,
      semester: req.body.semester,
      instructorID: req.body.instructor,
      content: req.body.content,
      rating: req.body.rating,
      reviewDate: new Date().toISOString(),
      approved: true,
      //swithc vote count to its own table
    };

    addReview(review);

    res.status(200).end("Review submitted");
  });

export default handler;
