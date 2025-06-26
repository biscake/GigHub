import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getKeysByUserAndDeviceId, getPublicKeysByUserId, updateDeviceKeys } from '../services/key.service';

export const getEncryptedPrivateKey = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const deviceId = req.params.deviceId;
  const { encryptedPrivateKey, iv, salt } = await getKeysByUserAndDeviceId({ userId, deviceId });

  res.status(200).json({
    success: true,
    message: "Get encrypted private key successfully",
    encryptedPrivateKey,
    iv,
    salt
  })
})

export const postDeviceKeys = asyncHandler(async (req: Request, res: Response) => {
  const { privateKey, publicKey, deviceId, userId } = req.body;
  const { encryptedPrivateKey, iv, salt } = privateKey;

  await updateDeviceKeys({ encryptedPrivateKey, iv, salt, publicKey, deviceId, userId });

  res.status(200).json({
    success: true,
    message: "New device for user created successfully",
  })
})

export const getPublicKey = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const deviceId = req.query.deviceId as string | undefined;

  const publicKeys = await getPublicKeysByUserId({ userId, deviceId });

  res.status(200).json({
    success: true,
    message: "Get public keys successfully",
    publicKeys
  })
})