import { ValidationError as ExpressValidatorError } from 'express-validator';
import { AppError } from './app-error';

export default class ValidationError extends AppError {
  constructor(errors: ExpressValidatorError[]) {
    super("Invalid input", 400, errors);
  }
}
