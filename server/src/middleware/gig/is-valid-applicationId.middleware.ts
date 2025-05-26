import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { BadRequestError } from "../../errors/bad-request-error";

export const isValidApplicationId = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const applicationId = parseInt(req.params.applicationId);

  if (isNaN(applicationId)) {
    throw new BadRequestError("Invalid application ID");
  }

  req.applicationId = applicationId;

  next();
})