import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { BadRequestError } from "../../errors/bad-request-error";

export const isOriginUserOfChat = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const originUserId = parseInt(req.params.originUserId);

  if (originUserId !== user.id) {
    throw new BadRequestError("You are not authorized to get this conversation messages");
  }

  next();
})