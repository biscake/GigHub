import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthorizationError } from "../../errors/authorization-error";

export const isAuthorizedToDeleteApplication = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const application = req.application;
  console.log(user.id, "user");
  console.log(req.application.userId, "app");

  if (user.id !== application.userId && user.role !== Role.ADMIN) {
    throw new AuthorizationError("Not authorized to delete this application");
  }

  return next();
});
