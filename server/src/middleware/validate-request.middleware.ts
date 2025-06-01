import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import ValidationError from '../errors/validation-error';

export const validateRequest = asyncHandler(async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  next();
});
