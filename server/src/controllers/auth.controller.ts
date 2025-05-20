import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { login, logout, register, rotateToken, resetPassword } from '../services/auth.service';

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

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
      sameSite: 'strict',
      secure: true,
      maxAge: TWO_WEEKS_MS
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

    const { newAccessToken, newRefreshToken, user } = await rotateToken({ refreshToken });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      ...(rememberMe ? { maxAge: TWO_WEEKS_MS } : {})
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

export const resetUserPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { resetToken } = req.body;
    const pwHash = req.pwHash;

    if (!pwHash) {
      throw new Error("pwHash missing");
    }

    await resetPassword({ resetToken, pwHash });

    res.status(200).json({
      success: true,
      message: 'Password successfully reset'
    });
  },
);