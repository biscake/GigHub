import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { prisma } from '../lib/prisma';

export const registerUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, email } = req.body;
    const pwHash = req.pwHash;

    const user = await prisma.user.create({
      data: {
        username,
        email,
        accounts: {
          create: {
            provider: 'credentials',
            providerAccountId: email,
            passwordHash: pwHash,
          },
        },
      },
    });

    res.json({ message: 'User successfully registered', user });
  },
);
