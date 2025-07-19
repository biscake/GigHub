import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { hashPlainPassword } from '../../utils/hash-password';

const SALT_ROUNDS = 10;

export const hashPassword = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    req.pwHash = await hashPlainPassword(req.body.password);
    next();
  },
);
