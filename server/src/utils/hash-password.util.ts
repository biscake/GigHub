import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

const saltRounds = 10;

export const hashPassword = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(req.body.password, salt);
    req.pwHash = hash;
    next();
  },
);
