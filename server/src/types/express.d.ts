import { User } from '@prisma/client';
import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    pwHash?: string;
    user?: User;
    idempotencyKey?: string;
    gigId?: number;
  }
}
