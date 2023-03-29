import nc from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next/types";
import {
  addReview,
  checkIfCourseExistsByInstructorAndSemester,
  checkReviewByUserAndCourse,
  getCourseByID,
  getReviewsByCourseID,
  updateUserCheck,
} from "../../../../../../lib/backend/database-utils";
import { getSession } from "next-auth/react";
import {
  canWriteReviews,
  containsProfanity,
  isQualityReview,
  uuidv4,
} from "../../../../../../lib/backend/utils";
import { CustomSession, public_course } from "../../../../../../lib/common/types";
import { areWeTwoThirdsThroughSemester, courseTags, isSemesterTooOld, isValidCourseID, primaryComponents } from "../../../../../../lib/common/utils";
import { getReviewByID, hasUserReviewedCourseOrAlias, voteReviewByID, __getFullReviewByID } from "../../../../../../lib/backend/database/review";
import { updateUserPermissions } from "../../../../../../lib/backend/database/users";
import { isCourseAnAliasForCourse } from "../../../../../../lib/backend/database/alias";

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
  /**
   * POST: adds a new review to the database
   */
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    //submit a review for a course

    const session = (await getSession({ req })) as CustomSession;

    console.log(req.body);

    if (!session) {
      return res
        .status(401)
        .end("Unauthorized: You must be logged in to submit a review");
    }

    if (session.user.role === "faculty") {
      return res.status(403).json({ message: "Instructors cannot review courses!" });
    }

    if (session.user.role !== "student" || ! await canWriteReviews(session.user.id)) {
      return res.status(403).json({ message: "You cannot submit a review for courses" });
    }

    const department = req.query.department as string;
    const courseNumber = req.query.coursenumber as string;
    let courseID = `${department.toUpperCase()}${courseNumber.trim()}`;
    const term = req.body.semester;

    /* Checks to ensure term is valid */
    if (!term) {
      return res.status(400).json({ message: "Invalid term" });
    }

    if (!areWeTwoThirdsThroughSemester(term)) {
      return res.status(400).json({ message: "You cannot review this course yet, please wait until roughly 2/3 of the semester has passed." });
    }


    if (isSemesterTooOld(term)) {
      return res.status(400).json({ message: "You cannot review this course with the selected semester as it occurred too long ago." });
    }


    //match course id of endpoint to course id in request body
    if (courseID !== req.body.courseID) {
      return res
        .status(400)
        .json({ message: "Endpoint course ID does not match course ID in request body" });
    }

    if (req.body.aliasID && isValidCourseID(req.body.aliasID)) { /* Ignore alias if it is not a valid course ID */
      if (!isCourseAnAliasForCourse(req.body.aliasID, courseID)) {
        return res.status(400).json({ message: "Invalid alias" });
      }

      courseID = req.body.aliasID as string;

    }

    //check if course id is valid
    let course: public_course = null
    try {
      course = await getCourseByID(courseID);
    }
    catch (err) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    if (!courseID || !req.body.courseID || course === null) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    if (await hasUserReviewedCourseOrAlias(session.user.id, courseID)) {
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
      req.body.content.length > 2048 ||
      req.body.content.length < 200
    ) {
      return res.status(400).json({ message: "Invalid review length" });
    }

    if (containsProfanity(req.body.content)) {
      return res.status(400).json({ message: "Review contains profanity" });
    }

    if (!isQualityReview(req.body.content, course.courseDescription)) {
      return res.status(400).json({ message: "Review quality is too low" });
    }

    // add check to see if review content is copy/pasted from other reviews


    //check that the course tags are valid
    if (req.body.courseTags) {
      if (req.body.courseTags.length > 3) {
        return res.status(400).json({ message: "Too many course tags" });
      }

      //also add the non-contradictory tag check here

      req.body.courseTags.forEach((tag: string) => {
        if (!courseTags.includes(tag)) {
          return res.status(400).json({ message: "Invalid course tag" });
        }
      });
    }

    //check the primary components are valid
    if (req.body.primaryComponent) {
      if (!Array.isArray(req.body.primaryComponent)) {
        return res.status(400).json({ message: "Invalid primary components" });
      }

      if (req.body.primaryComponent.length > 3) {
        return res.status(400).json({ message: "Too many primary components" });
      }

      req.body.primaryComponent.forEach((component: string) => {
        if (!primaryComponents.includes(component)) {
          return res.status(400).json({ message: "Invalid primary component" });
        }
      });
    }


    // check again that the review does not exist (prevent replay race condition / attack)
    await new Promise((resolve) => setTimeout(resolve, 500)); /* wait 500ms to allow for the database to update */
    if (await hasUserReviewedCourseOrAlias(session.user.id, courseID)) {
      console.log(`user ${session.user.id} already submitted a review for ${courseID}`);
      return res
        .status(403)
        .json({ message: "You have already submitted a review for this course" });
    }


    const clamp = (x: number, min = 0, max = 10) => Math.max(Math.min(x, max), min);

    const parseReviewInt = (s: string, min = 0, max = 10, def = 5) => {
      if (!s) {
        return def;
      }
      const x = parseInt(s, 10) ?? 5;
      return clamp(x, min, max);
    }

    const review = {
      reviewID: uuidv4(),
      reviewerID: session.user.id,
      courseID: courseID,
      semester: req.body.semester,
      instructorID: req.body.instructor,
      whyTake: req.body.whyTake,
      inMajorMinor: req.body.inMajorMinor,
      content: req.body.content,
      rating: parseReviewInt(req.body.rating),
      reviewDate: new Date().toISOString(),
      approved: true,
      difficulty: parseReviewInt(req.body.difficulty),
      value: parseReviewInt(req.body.value),
      hours: parseReviewInt(req.body?.hours, 0, 30, 0),
      again: req.body.again ?? false,
      primaryComponent: req.body.primaryComponent,
      tags: req.body.courseTags,
      instructorEffectiveness: parseReviewInt(req.body.instructorEffectiveness),
      instructorAccommodationLevel: parseReviewInt(
        req.body.instructorAccommodationLevel
      ),
      instructorEnthusiasm: parseReviewInt(req.body.instructorEnthusiasm),
      instructorAgain: req.body.instructorAgain ?? false,
      instructorEnjoyed: req.body?.instructorEnjoyed ?? false,
    };

    try {
      await addReview(review);
      await voteReviewByID(review.reviewID, session.user.id, "up");
      await updateUserPermissions(session.user.id)
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.status(200).end("Review submitted");
  })
  /**
   * PATCH: Edit an existing review
   */
  .patch(async (req, res) => {

    // Issue the same checks as POST /review

    const session = (await getSession({ req })) as CustomSession;

    console.log(req.body);

    if (!session) {
      return res
        .status(401)
        .end("Unauthorized: You must be logged in to submit a review");
    }

    if (session.user.role === "faculty") {
      return res.status(403).json({ message: "Instructors cannot review courses!" });
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
    let course: public_course = null
    try {
      course = await getCourseByID(courseID);
    }
    catch (err) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    if (!courseID || !req.body.courseID || course === null) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    if (!(await checkReviewByUserAndCourse(session.user.id, courseID))) {
      console.log(`user ${session.user.id} has not submitted a review for ${courseID}`);
      return res
        .status(403)
        .json({ message: "You have not submitted a review for this course" });
    }

    //check the user is the author of the review
    const oldReview = await __getFullReviewByID(req.body.reviewID);
    if (oldReview.reviewerID !== session.user.id) {
      return res.status(403).json({ message: "You are not the author of this review!" });
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
      req.body.content.length > 2048 ||
      req.body.content.length < 200
    ) {
      return res.status(400).json({ message: "Invalid review length" });
    }

    if (containsProfanity(req.body.content)) {
      return res.status(400).json({ message: "Review contains profanity" });
    }

    if (!isQualityReview(req.body.content, course.courseDescription)) {
      return res.status(400).json({ message: "Review quality is too low" });
    }

    // add check to see if review content is copy/pasted from other reviews


    //check that the course tags are valid
    if (req.body.courseTags) {
      if (req.body.courseTags.length > 3) {
        return res.status(400).json({ message: "Too many course tags" });
      }

      // TODO: also add the non-contradictory tag check here
      req.body.courseTags.forEach((tag: string) => {
        if (!courseTags.includes(tag)) {
          return res.status(400).json({ message: "Invalid course tag" });
        }
      });
    }

    //check the primary components are valid
    if (req.body.primaryComponent) {
      if (!Array.isArray(req.body.primaryComponent)) {
        return res.status(400).json({ message: "Invalid primary components" });
      }

      if (req.body.primaryComponent.length > 3) {
        return res.status(400).json({ message: "Too many primary components" });
      }

      req.body.primaryComponent.forEach((component: string) => {
        if (!primaryComponents.includes(component)) {
          return res.status(400).json({ message: "Invalid primary component" });
        }
      });
    }


    const clamp = (x: number, min = 0, max = 10) => Math.max(Math.min(x, max), min);

    const parseReviewInt = (s: string, min = 0, max = 10, def = 5) => {
      if (!s) {
        return def;
      }
      const x = parseInt(s, 10) ?? 5;
      return clamp(x, min, max);
    }

    const review = {
      reviewID: req.body.reviewID,
      reviewerID: session.user.id,
      courseID: courseID,
      semester: req.body.semester,
      instructorID: req.body.instructor,
      whyTake: req.body.whyTake,
      inMajorMinor: req.body.inMajorMinor,
      content: req.body.content,
      rating: parseReviewInt(req.body.rating),
      // reviewDate: new Date().toISOString(), /* do NOT reset the review date */
      // approved: true,
      difficulty: parseReviewInt(req.body.difficulty),
      value: parseReviewInt(req.body.value),
      hours: parseReviewInt(req.body?.hours, 0, 30, 0),
      again: req.body.again ?? false,
      primaryComponent: req.body.primaryComponent,
      tags: req.body.courseTags,
      instructorEffectiveness: parseReviewInt(req.body.instructorEffectiveness),
      instructorAccommodationLevel: parseReviewInt(
        req.body.instructorAccommodationLevel
      ),
      instructorEnthusiasm: parseReviewInt(req.body.instructorEnthusiasm),
      instructorAgain: req.body.instructorAgain ?? false,
      instructorEnjoyed: req.body?.instructorEnjoyed ?? false,
    };

    try {
      await addReview(review, true);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.status(200).end("Review submitted");



  });

export default handler;
