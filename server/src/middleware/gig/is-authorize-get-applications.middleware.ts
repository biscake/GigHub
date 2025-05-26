import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthorizationError } from "../../errors/authorization-error";

export const isAuthorizedToGetApplications = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const gig = req.gig;

  const user = req.user;

  if (gig.authorId !== user.id) {
    throw new AuthorizationError("Not authorized to get gig applications");
  }

  return next();
});
