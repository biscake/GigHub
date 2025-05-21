import { ValidationError as ExpressValidatorError } from 'express-validator';

export class AppError extends Error {
  statusCode: number;
  errors?: ExpressValidatorError[];

  constructor(message: string, statusCode: number, errors?: ExpressValidatorError[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}