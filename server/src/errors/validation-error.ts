import { ValidationError as ExpressValidatorError } from 'express-validator';

export default class ValidationError extends Error {
  statusCode: number;
  errors: ExpressValidatorError[];

  constructor(errors: ExpressValidatorError[], message = 'Invalid input') {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.errors = errors;
    Error.captureStackTrace(this, ValidationError);
  }
}
