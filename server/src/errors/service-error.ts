import { AppError } from "./app-error";

export class ServiceError extends AppError {
  constructor(service = "Service", message = "Failed to communicate with external service") {
    super(`${service} error: ${message}`, 500);
  }
}