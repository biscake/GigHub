import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { BadRequestError } from "../../errors/bad-request-error";

export const isAuthorizedToAcceptGig = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const gig = req.gig;

  if (gig.authorId !== user.id) {
    throw new BadRequestError("You are not authorized to accept this gig");
  }

  next();
})