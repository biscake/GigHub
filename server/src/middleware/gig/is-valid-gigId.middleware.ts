import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { BadRequestError } from "../../errors/bad-request-error";
import { NotFoundError } from "../../errors/not-found-error";
import { getGigFromDatabaseById } from "../../services/gig.service";

export const isValidGigId = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const gigId = parseInt(req.params.gigId);

  if (isNaN(gigId)) {
    throw new BadRequestError("Invalid gig ID");
  }

  const gig = await getGigFromDatabaseById({ id: gigId });

  if (!gig) {
    throw new NotFoundError("Gig");
  }

  req.gig = gig;

  next();
})