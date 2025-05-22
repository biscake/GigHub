import { NextFunction, Request, Response } from 'express';
import { type ValidationError as ExpressValidatorError } from 'express-validator';
import { MulterError } from 'multer';
import { AppError } from '../errors/app-error';
import { CustomError, ErrorResponse } from '../types/error';

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err?.statusCode ?? 500;
  let message = 'Something went wrong';
  let errors: ExpressValidatorError[] | null = null;

  if (err instanceof MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File is too large. Maximum allowed size is 5MB.';
    } else {
      message = err.message;
    }
  }

  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors ?? null;
  }

  else if (err instanceof Error) {
    message = err.message;
  }

  const response: ErrorResponse = {
    success: false,
    status: statusCode,
    message,
    ...(errors && { errors }),
  };

  // Include stack only in development
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};