import { ValidationError as ExpressValidatorError } from 'express-validator';

export interface CustomError extends Error {
  statusCode?: number;
  errors?: ExpressValidatorError[];
}

export interface ErrorResponse {
  success: boolean;
  status: number;
  message: string;
  stack?: string | undefined;
  errors?: ExpressValidatorError[];
}
