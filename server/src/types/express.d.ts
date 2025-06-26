import { Device, Gig, GigApplication, User } from '@prisma/client';
import expressWs from 'express-ws';
import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    pwHash: string;
    user: User & { deviceId: string };
    idempotencyKey: string;
    gig: Gig & { GigApplication?: GigApplication[] };
    application: GigApplication;
    device: Device;
  }

  interface Application {
    ws: expressWs.Application['ws'];
  }
}