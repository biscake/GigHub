import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { BadRequestError } from "../../errors/bad-request-error";

export const isValidGigId = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const gigId = parseInt(req.params.id);

  if (isNaN(gigId)) {
    throw new BadRequestError("Invalid gig ID");
  }

  req.gigId = gigId;

  next();
})