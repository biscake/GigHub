import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import ValidationError from '../errors/validation-error';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }

  next();
};
