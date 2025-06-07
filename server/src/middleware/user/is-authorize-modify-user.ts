import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthorizationError } from "../../errors/authorization-error";

export const isAuthorizedToModifyUser = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const application = req.application;

  if (user.id !== application.userId && user.role !== Role.ADMIN) {
    throw new AuthorizationError("Not authorized to modify this user");
  }

  return next();
});