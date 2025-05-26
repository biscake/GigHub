import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthorizationError } from "../../errors/authorization-error";

export const isAuthorizedToDeleteGig = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const gig = req.gig;
  const user = req.user;

  if (user.id !== gig.authorId && user.role !== Role.ADMIN) {
    throw new AuthorizationError("Not authorized to delete this gig");
  }

  return next();
});
