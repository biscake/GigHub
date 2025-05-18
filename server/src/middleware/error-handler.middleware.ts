import { NextFunction, Request, Response } from 'express';
import { CustomError, ErrorResponse } from '../types/error';

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = err.statusCode ?? 500;

  const errors = err.errors ?? null;

  const message = err.message || 'Something went wrong';

  const response: ErrorResponse = {
    success: false,
    status: statusCode,
    message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};
