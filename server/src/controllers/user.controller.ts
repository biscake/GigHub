import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getUserWithNormalizedProfileByUsername, getUserWithReviewsByUsername, updateUserByUsername } from '../services/user.service';
import { storeResponse } from '../services/idempotency.service';
import { createId } from '@paralleldrive/cuid2';
import { uploadSingleImageToR2 } from '../services/r2.service';

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

export const editUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const idempotencyKey = req.idempotencyKey;

  const key = file
    ? `profiles/${createId()}-${file.originalname}`
    : "default/Default_pfp.svg";

  const profileDetails = {
    ...req.body,
    profilePictureKey: key
  }

  await updateUserByUsername(profileDetails);

  if (file) {
    await uploadSingleImageToR2({
      fileBuffer: file.buffer,
      key: key,
      contentType: file.mimetype
    })
  }

  const responseBody = {
    success: true,
    message: "User profile updated successfully"
  }

  await storeResponse({ responseBody, idempotencyKey });

  res.status(200).json(responseBody);
})

export const getReceivedReviewsByUsername = asyncHandler(async (req: Request, res: Response) => {
  const username = req.params.username;
  const NUMBER_OF_REVIEWS = 5;

  const user = await getUserWithReviewsByUsername({ username, NUMBER_OF_REVIEWS });

  res.status(200).json({
    success: true,
    message: "Get received reviews successfully",
    receivedReviews: user.receivedReviews
  })
})