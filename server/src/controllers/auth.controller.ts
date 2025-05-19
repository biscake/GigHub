import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import ValidationError from '../errors/validation-error';
import { prisma } from '../lib/prisma';
import { issueAccessToken, issueRefreshToken } from '../utils/issue-tokens.util';


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
    const refreshToken = issueRefreshToken();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 24 * 14 * 60 * 60 * 1000, // 24hrs * 14d
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
    const refreshToken = issueRefreshToken();

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14days
        userId: user.id
      }
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 24 * 14 * 60 * 60 * 1000, // 24hrs * 14d
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user,
      accessToken: accessToken,
    });
  },
);

export const refreshToken = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next(new ValidationError('No refresh token', 401));
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken
      },
      include: {
        user: true
      }
    })

    if (storedToken?.revoked) {
      return next(new ValidationError('Invalid refresh token', 403));
    }

    if (!storedToken?.user) {
      throw new Error("Missing user to create refresh token");
    }

    const newAccessToken = issueAccessToken(storedToken.user);
    const newRefreshToken = issueRefreshToken();

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { token: refreshToken },
        data: {
          revoked: true
        }
      }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14days
          userId: storedToken.userId
        }
      })
    ])

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 24 * 14 * 60 * 60 * 1000, // 14days
    });

    res.status(200).json({
      success: true,
      message: 'Access token refreshed',
      user: storedToken.user,
      accessToken: newAccessToken,
    });
  }
)

export const logoutUser = (_req: Request, res: Response) => {
  res.clearCookie('refreshToken').json({ success: true, message: 'Cookie cleared' });
};
