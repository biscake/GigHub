import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AppError } from "../errors/app-error";
import { AuthenticationError } from "../errors/authentication-error";
import { AuthorizationError } from "../errors/authorization-error";
import { NotFoundError } from "../errors/not-found-error";
import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";

export const isUserAuthorizedToDeleteGig = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.user);
    if (!req.user) {
      throw new AuthenticationError("User not authenticated");
    }

    const { gigId } = req.body;
    const user = req.user;

    const gig = await prisma.gig.findUnique({
      where: {
        id: gigId
      }
    })
  
    if (!gig) {
      throw new NotFoundError("Gig not found");
    }
  
    if (!user) {
      throw new NotFoundError("User not found");
    }
  
    if (user.id != gig.authorId && user.role != Role.ADMIN) {
      throw new AuthorizationError("Not authorized to delete this gig");
    }
  
    next();
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new ServiceError("Prisma", "Failed to check if user is authorized");
  }
});