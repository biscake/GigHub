import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

const SALT_ROUNDS = 10;

export const hashPassword = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(req.body.password, salt);
    req.pwHash = hash;
    next();
  },
);
