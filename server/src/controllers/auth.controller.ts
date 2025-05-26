import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { BadRequestError } from '../errors/bad-request-error';
import { login, logout, register, resetPassword, rotateToken } from '../services/auth.service';
import { storeResponse } from '../services/idempotency.service';

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

export const registerUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, email } = req.body;
    const pwHash = req.pwHash;
    const idempotencyKey = req.idempotencyKey;

    if (!pwHash) {
      throw new BadRequestError("Password hash missing");
    }

    const { accessToken, refreshToken, user } = await register({ username, email, pwHash });

    const responseBody = {
      success: true,
      message: 'User successfully registered',
      user,
      accessToken: accessToken,
    };

    await storeResponse({responseBody, idempotencyKey});

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: TWO_WEEKS_MS
    });

    res.status(200).json(responseBody);
  },
);

export const loginUserCredentials = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, password, rememberMe } = req.body;

    const { accessToken, refreshToken, user } = await login({ username, password });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      ...(rememberMe ? { maxAge: TWO_WEEKS_MS } : {})
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
  ) => {
    const refreshToken = req.cookies.refreshToken;
    const { rememberMe } = req.body;
    const idempotencyKey = req.idempotencyKey;

    const { newAccessToken, newRefreshToken, user } = await rotateToken({ refreshToken });

    const responseBody = {
      success: true,
      message: 'Access token refreshed',
      user,
      accessToken: newAccessToken,
    }

    await storeResponse({ responseBody, idempotencyKey });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      ...(rememberMe ? { maxAge: TWO_WEEKS_MS } : {})
    });

    res.status(200).json(responseBody);
  }
)

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  await logout({ token });
  res.clearCookie('refreshToken').json({ success: true, message: 'Cookie cleared' });
})

export const resetUserPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { resetToken } = req.body;
    const pwHash = req.pwHash;

    if (!pwHash) {
      throw new BadRequestError("Password Hash missing");
    }

    await resetPassword({ resetToken, pwHash });

    res.status(200).json({
      success: true,
      message: 'Password successfully reset'
    });
  },
);