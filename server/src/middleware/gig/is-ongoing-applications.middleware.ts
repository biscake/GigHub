import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { BadRequestError } from "../../errors/bad-request-error";
import { getAcceptedApplicationsByGigId } from "../../services/gig.service";

export const isOngoingApplications = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const gig = req.gig;
  const applications = await getAcceptedApplicationsByGigId({ gigId: gig.id });

  if (applications && applications.length !== 0) {
    throw new BadRequestError("You cannot delete this gig because it is currently being worked on by accepted applicants.")
  }

  next();
})