import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";
import { GetSenderIdByMessageIdParams, MarkMessageIdArrayAsReadParams, StoreCiphertextInDbParams } from "../types/chat";

export const storeCiphertextInDb = async ({ senderId, senderDeviceId, receipientId, payloadMessages }: StoreCiphertextInDbParams) => {
  try {
    await prisma.chatMessage.create({
      data: {
        senderId,
        receipientId,
        devices: {
          createMany: {
            data: payloadMessages.map(msg => ({
              senderDeviceId,
              receipientDeviceId: msg.deviceId,
              ciphertext: msg.ciphertext
            }))
          }
        }
      }
    });
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to store message in database");
  }
}

export const markMessageIdArrayAsRead = async ({ messageIds, receipientId }: MarkMessageIdArrayAsReadParams) => {
  try {
    await prisma.chatMessage.updateMany({
      where: {
        id: {
          in: messageIds,
        },
        receipientId
      },
      data: {
        readAt: new Date()
      }
    })
  } catch {
    throw new ServiceError("Prisma", "Failed to update read receipts in database");
  }
}

export const getMessagesByMessageIdArray = async ({ messageIds }: GetSenderIdByMessageIdParams) => {
  try {
    const result = await prisma.chatMessage.findMany({
      where: {
        id: {
          in: messageIds
        }
      }
    })

    return result;
  } catch {
    throw new ServiceError("Prisma", "Failed to get messages from database");
  }
}