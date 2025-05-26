import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getUserWithNormalizedProfileByUsername } from '../services/user.service';

export const getProfileByUsername = asyncHandler(async (req: Request, res: Response) => {
  const username = req.params.username;

  const user = await getUserWithNormalizedProfileByUsername({ username });

  const profile = {
    ...user.profile,
    username: user.username
  }

  res.status(200).json({
    success: true,
    message: "Get profile successfully",
    profile
  })
})