import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import ValidationError from '../errors/validation-error';
import { prisma } from '../lib/prisma';
import { login, logout, register, rotateToken } from '../services/auth.service';
import { issueAccessToken, issueRefreshToken } from '../utils/issue-tokens.util';


export const registerUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, email } = req.body;
    const pwHash = req.pwHash;

    if (!pwHash) {
      throw new Error("pwHash missing");
    }

    const { accessToken, refreshToken, user } = await register({ username, email, pwHash });

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

    const { accessToken, refreshToken, user } = await login({ username, password });

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

    const { newAccessToken, newRefreshToken, user } = await rotateToken({ refreshToken });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 24 * 14 * 60 * 60 * 1000, // 14days
    });

    res.status(200).json({
      success: true,
      message: 'Access token refreshed',
      user,
      accessToken: newAccessToken,
    });
  }
)

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  await logout({ token });
  res.clearCookie('refreshToken').json({ success: true, message: 'Cookie cleared' });
})
