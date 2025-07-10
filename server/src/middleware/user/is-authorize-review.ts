import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthorizationError } from "../../errors/authorization-error";
import { prisma } from "../../lib/prisma";

export const isAuthorizedToReview = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const { revieweeId } = req.body;
  console.log(user)
  console.log(req.body)
  if (user.id === revieweeId) {
    throw new AuthorizationError("You cannot review yourself");
  }

  const existing = await prisma.review.findFirst({
    where: { reviewerId: user.id, revieweeId },
  });
  
  if (existing) {
    throw new AuthorizationError("You have already reviewed this user");
  }

  return next();
});