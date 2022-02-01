/**
 * Allows authenticated users to flag reviews for moderation.
 * Administrators can get a list of all flagged reviews.
 * 
 * GET: returns a list of flagged reviews
 * POST: adds a review to the flagged list
 * 
 */



//need to record who is flagging incase someone is malicious

import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";