import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { BadRequestError } from "../../errors/bad-request-error";

export const isAuthorizedToApplyGig = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const gig = req.gig;

  if (gig.authorId === user.id) {
    throw new BadRequestError("Unable to apply to your own gig");
  }

  // check if userId is blocked by author (future feat)

  next();
})