import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    pwHash?: string;
    username?: string;
    email?: string;
  }
}
