export type ValidationError = {
  msg: string;
}

export type ApiErrorResponse = {
  errors?: ValidationError[]; 
  message: string;
}