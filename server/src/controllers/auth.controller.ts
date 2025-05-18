import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { getKeys } from '../config/keys';
import ValidationError from '../errors/validation-error';
import { prisma } from '../lib/prisma';
import { JwtPayload } from '../types/jwt-payload';
import { issueAccessToken, issueRefreshToken } from '../utils/issue-jwt.util';

const keys = getKeys();

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

    const accessToken = issueAccessToken(user);
    const refreshToken = issueRefreshToken(user);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 24 * 14 * 60 * 60 * 1000 // 24hrs * 14d 
    });

    res.status(200).json({
      success: true,
      message: 'User successfully registered',
      user,
      accessToken: accessToken,
    });
  },
);

export const loginUserCredentials = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      include: {
        accounts: {
          where: {
            provider: 'credentials',
          },
          select: {
            passwordHash: true,
          },
        },
      },
    });

    if (!user || !user.accounts[0]?.passwordHash) {
      throw new ValidationError('Invalid username or password', 406);
    }

    const isValid = await bcrypt.compare(
      password,
      user.accounts[0].passwordHash,
    );

    if (!isValid) {
      throw new ValidationError('Invalid username or password', 406);
    }

    const accessToken = issueAccessToken(user);
    const refreshToken = issueRefreshToken(user);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 24 * 14 * 60 * 60 * 1000 // 24hrs * 14d 
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user,
      accessToken: accessToken,
    });
  },
);

export const refreshToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;

  if (!token) {
    next(new ValidationError("Unauthorized", 401));
  }

  jwt.verify(token, keys.refresh.public, { algorithms: ['RS256'] }, async (err, decoded) => {
    if (err) {
      next(new ValidationError("Invalid refresh token", 403));
    }

    const payload = decoded as unknown as JwtPayload;

    const user = await prisma.user.findUnique({
      where: {
        id: payload.sub 
      }
    })

    if (!user) {
      throw new ValidationError("User not found", 404);
    }

    const accessToken = issueAccessToken(user);

    res.status(200).json({
      success: true,
      message: 'Access token refreshed',
      user,
      accessToken: accessToken,
    });    
  })
}

export const logoutUser = (_req: Request, res: Response) => {
  res.clearCookie('jwt').json({ success: true, message: 'Cookie cleared' });
}