import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import ValidationError from '../errors/validation-error';
import { prisma } from '../lib/prisma';
import { issueJwt } from '../utils/issue-jwt.util';

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

    const { token, expires } = issueJwt(user);

    res.status(200).json({
      success: true,
      message: 'User successfully registered',
      user,
      token: token,
      expiresIn: expires,
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
      throw new ValidationError('Invalid username or password', 401);
    }

    const isValid = await bcrypt.compare(
      password,
      user.accounts[0].passwordHash,
    );

    if (!isValid) {
      throw new ValidationError('Invalid username or password', 401);
    }

    const { token, expires } = issueJwt(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user,
      token: token,
      expiresIn: expires,
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
