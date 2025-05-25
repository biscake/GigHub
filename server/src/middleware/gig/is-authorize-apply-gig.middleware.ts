import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AppError } from "../../errors/app-error";
import { AuthenticationError } from "../../errors/authentication-error";
import { BadRequestError } from "../../errors/bad-request-error";
import { NotFoundError } from "../../errors/not-found-error";
import { ServiceError } from "../../errors/service-error";
import { prisma } from "../../lib/prisma";

export const isAuthorizedToApplyGig = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AuthenticationError("User not authenticated");
    }

    const user = req.user;
    const gigId = req.gigId;

    const gig = await prisma.gig.findUnique({
      where: {
        id: gigId
      }
    })

    if (!gig) {
      throw new NotFoundError("Gig not found");
    }

    if (gig.authorId == user.id) {
      throw new BadRequestError("Unable to apply to your own gig");
    }

    // check if userId is blocked by author (future feat)

    next();
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new ServiceError("Prisma", "Failed to get gig from database");
  }
})