import { AppError } from "../errors/app-error";
import { NotFoundError } from "../errors/not-found-error";
import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";
import { GetDeviceByDeviceIdParams, GetPublicKeysByUserIdParams, StoreNewDeviceByUserIdParams } from "../types/key";

export const getDeviceByDeviceId = async ({ deviceId }: GetDeviceByDeviceIdParams) => {
  try {
    const device = await prisma.device.findUnique({
      where: { deviceId }
    });

    if (!device) {
      throw new NotFoundError("Device");
    }
  
    return device;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new ServiceError("Prisma", "Failed to get device from database");
  }
}

export const storeNewDeviceByUserId = async ({ encryptedPrivateKey, iv, salt, publicKey, deviceId, userId }: StoreNewDeviceByUserIdParams) => {
  try {
    await prisma.device.create({
      data: {
        deviceId,
        userId,
        publicKey: JSON.stringify(publicKey),
        encryptedPrivateKey,
        iv,
        salt
      }
    })
  } catch (err) {
    console.error(err);
    throw new ServiceError("Prisma", "Failed to create new device for user");
  }
}

export const getPublicKeysByUserId = async ({ userId }: GetPublicKeysByUserIdParams) => {
  try {
    const result = await prisma.device.findMany({
      where: { userId },
      select: {
        publicKey: true,
        deviceId: true
      }
    })

    if (!result) {
      throw new NotFoundError("User devices");
    }

    const parsedPublicKeys = result.map(key => ({ ...key, publicKey: JSON.parse(key.publicKey) }));

    return parsedPublicKeys;
  } catch {
    throw new ServiceError("Prisma", "Failed to retrieve public key for user");
  }
}