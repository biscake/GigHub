import { ValidationError as ExpressValidatorError } from 'express-validator';

export default class ValidationError extends Error {
  statusCode: number;
  errors: ExpressValidatorError[];

  constructor(message: string, statusCode: number);
  constructor(errors: ExpressValidatorError[]);
  constructor(arg1: string | ExpressValidatorError[], arg2?: number) {
    if (typeof arg1 === 'string') {
      super(arg1);
      this.errors = [];
      this.statusCode = arg2 ?? 400;
    } else {
      super('Invalid input');
      this.errors = arg1;
      this.statusCode = 400;
    }

    this.name = 'ValidationError';
    Error.captureStackTrace(this, ValidationError);
  }
}
