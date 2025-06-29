import { AppError } from "../errors/app-error";
import { NotFoundError } from "../errors/not-found-error";
import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";
import { GetKeysByUserAndDeviceIdParams, GetPublicKeysByUserIdParams, UpdateDeviceKeysParams } from "../types/key";

export const getKeysByUserAndDeviceId = async ({ userId, deviceId }: GetKeysByUserAndDeviceIdParams) => {
  try {
    const device = await prisma.device.findUnique({
      where: {
        deviceId_userId: {
          deviceId,
          userId
        }
      }
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

export const updateDeviceKeys = async ({ encryptedPrivateKey, iv, salt, publicKey, deviceId, userId }: UpdateDeviceKeysParams) => {
  try {
    await prisma.device.update({
      where: {
        deviceId_userId: {
          deviceId,
          userId
        }
      },
      data: {
        publicKey: JSON.stringify(publicKey),
        encryptedPrivateKey,
        iv,
        salt
      }
    })
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to create new device for user");
  }
}

export const getPublicKeysByUserId = async ({ userId, deviceId }: GetPublicKeysByUserIdParams) => {
  try {
    const result = await prisma.device.findMany({
      where: {
        userId,
        ...(deviceId && { deviceId })
      },
      select: {
        publicKey: true,
        deviceId: true
      }
    })

    if (!result) {
      throw new NotFoundError("User devices");
    }

    const parsedPublicKeys = result.map(({ publicKey, ...rest }) => ({ ...rest, ...(publicKey && { publicKey: JSON.parse(publicKey) }) }));

    return parsedPublicKeys;
  } catch {
    throw new ServiceError("Prisma", "Failed to retrieve public key for user");
  }
}