import { NextFunction, Request, Response } from 'express';
import ValidationError from '../errors/validation-error';
import { CustomError } from '../types/error';

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = err.statusCode ?? 500;

  const errors = err.errors ?? null;

  const message = err.message || 'Something went wrong';

  if (err instanceof ValidationError) {
    res.status(statusCode).json({
      success: false,
      status: statusCode,
      message,
      errors,
      stack: process.env.NODE_ENV === 'development' ? err.stack : {},
    });

    return;
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
};
