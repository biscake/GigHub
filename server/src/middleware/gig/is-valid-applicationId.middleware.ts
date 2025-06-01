import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { BadRequestError } from "../../errors/bad-request-error";
import { getApplicationByApplicationId } from "../../services/gig.service";
import { NotFoundError } from "../../errors/not-found-error";

export const isValidApplicationId = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const applicationId = parseInt(req.params.applicationId);

  if (isNaN(applicationId)) {
    throw new BadRequestError("Invalid application ID");
  }

  const application = await getApplicationByApplicationId({ applicationId })

  if (!application) {
    throw new NotFoundError("Application not found");
  }

  req.application = application;

  next();
})