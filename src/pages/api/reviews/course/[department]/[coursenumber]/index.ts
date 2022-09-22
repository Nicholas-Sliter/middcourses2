import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
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
import { CustomSession } from "../../../../../../lib/common/types";

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

    const session = (await getSession({ req })) as CustomSession;

    console.log(req.body);

    if (!session) {
      return res
        .status(401)
        .end("Unauthorized: You must be logged in to submit a review");
    }

    if (session.user.role !== "student" || ! await canWriteReviews(session.user.id)) {
      return res.status(403).json({ message: "You cannot submit a review for courses" });
    }

    const department = req.query.department as string;
    const courseNumber = req.query.coursenumber as string;
    const courseID = `${department.toUpperCase()}${courseNumber.trim()}`;

    //match course id of endpoint to course id in request body
    if (courseID !== req.body.courseID) {
      return res
        .status(400)
        .json({ message: "Endpoint course ID does not match course ID in request body" });
    }

    //check if course id is valid
    if (!courseID || !req.body.courseID || await getCourseByID(courseID) === null) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    if (await checkReviewByUserAndCourse(session.user.id, courseID)) {
      console.log(`user ${session.user.id} already submitted a review for ${courseID}`);
      return res
        .status(403)
        .json({ message: "You have already submitted a review for this course" });
    }

    //check semester and instructor
    if (!req.body.semester || !req.body.instructor) {
      return res.status(400).json({ message: "Invalid semester or instructor" });
    }

    if (
      ! await checkIfCourseExistsByInstructorAndSemester(
        courseID,
        req.body.instructor,
        req.body.semester
      )
    ) {
      return res.status(400).json({ message: "Invalid semester or instructor" });
    }

    //check if review is valid
    if (
      !req.body.content ||
      req.body.content.length > 1000 ||
      req.body.content.length < 200
    ) {
      return res.status(400).json({ message: "Invalid review length" });
    }

    if (containsProfanity(req.body.content)) {
      return res.status(400).json({ message: "Review contains profanity" });
    }

    const clamp = (x: number, min = 0, max = 10) => Math.max(Math.min(x, max), min);

    const parseReviewInt = (s, min = 1, max = 10) => {
      const x = parseInt(s, 10) ?? 5;
      return clamp(x, min, max);
    }


    const review = {
      reviewID: uuidv4(),
      reviewerID: session.user.id,
      courseID: courseID,
      semester: req.body.semester,
      instructorID: req.body.instructor,
      content: req.body.content,
      rating: parseReviewInt(req.body.rating),
      reviewDate: new Date().toISOString(),
      approved: true,
      voteCount: 0,
      difficulty: parseReviewInt(req.body.difficulty),
      value: parseReviewInt(req.body.value),
      hours: parseReviewInt(req.body.hours, 0, 30),
      again: req.body.again ?? false,
      primaryComponent: req.body.primaryComponent?.toLowerCase(),
      instructorEffectiveness: parseReviewInt(req.body.instructorEffectiveness),
      instructorAccommodationLevel: parseReviewInt(
        req.body.instructorAccommodationLevel
      ),
      instructorEnthusiasm: parseReviewInt(req.body.instructorEnthusiasm),
      instructorAgain: req.body.instructorAgain ?? false,
    };

    await addReview(review);

    res.status(200).end("Review submitted");
  });

export default handler;
