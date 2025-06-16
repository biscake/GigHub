import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getPublicKeysByUserId, storeNewDeviceByUserId } from '../services/key.service';

export const getEncryptedPrivateKey = asyncHandler(async (req: Request, res: Response) => {
  const { encryptedPrivateKey } = req.device;

  res.status(200).json({
    success: true,
    message: "Get encrypted private key successfully",
    encryptedPrivateKey
  })
})

export const postNewDevice = asyncHandler(async (req: Request, res: Response) => {
  const { privateKey, publicKey, deviceId, userId } = req.body;
  const { encryptedPrivateKey, iv, salt } = privateKey;

  await storeNewDeviceByUserId({ encryptedPrivateKey, iv, salt, publicKey, deviceId, userId });

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