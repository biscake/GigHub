import { S3ServiceException } from '@aws-sdk/client-s3';
import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import ValidationError from '../errors/validation-error';
import { CustomError, ErrorResponse } from '../types/error';

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode ?? 500;
  let message = err.message || 'Something went wrong';
  let errors;

  // Validation Error
  if (err instanceof ValidationError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  // Prisma known errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 400;
      const target = (err.meta as { target?: string[] })?.target;
      const field = target?.join(', ') || 'field';

      message = `Duplicate value for: ${field}`;
    }
  }

  // Prisma validation error
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid input data';
  }

  // Multer error
  else if (err instanceof MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File is too large. Maximum allowed size is 5MB.';
    } else {
      message = err.message;
    }
  }

  // AWS SDK error
  else if (err instanceof S3ServiceException) {
    statusCode = 500;
    message = 'A cloud service error occurred. Please try again later.';
  }

  const response: ErrorResponse = {
    success: false,
    status: statusCode,
    message,
  };

  // Include stack only in development
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
    response.stack = err.stack;
  }

  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};