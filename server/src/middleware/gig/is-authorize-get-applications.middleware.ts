import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AppError } from "../../errors/app-error";
import { AuthenticationError } from "../../errors/authentication-error";
import { AuthorizationError } from "../../errors/authorization-error";
import { NotFoundError } from "../../errors/not-found-error";
import { ServiceError } from "../../errors/service-error";
import { prisma } from "../../lib/prisma";

export const isAuthorizedToGetApplications = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AuthenticationError("User not authenticated");
    }

    const gigId = req.gigId;

    const user = req.user;

    const gig = await prisma.gig.findUnique({
      where: {
        id: gigId
      },
      include: {
        GigApplication: true
      }
    })
  
    if (!gig) {
      throw new NotFoundError("Gig not found");
    }

    if (gig.authorId != user.id) {
      throw new AuthorizationError("Not authorized to get gig applications");
    }

    req.gig = gig;
  
    return next();
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new ServiceError("Prisma", "Failed to get gig from database");
  }
});
