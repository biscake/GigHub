import { Gig, User } from '@prisma/client';
import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    pwHash: string;
    user: User;
    idempotencyKey: string;
    gig: Gig & { GigApplication?: GigApplication[] }; 
    applicationId: number;
  }
}
