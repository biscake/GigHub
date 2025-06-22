import { NotFoundError } from "../errors/not-found-error";
import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";
import { GetChatMessagesParams, GetChatMessagesRes, GetMessagesSinceParams, GetSenderIdByMessageIdParams, GetUpdatedReadReceipt, MarkMessageIdArrayAsReadParams, StoreCiphertextInDbParams } from "../types/chat";

export const storeCiphertextInDb = async ({ senderId, senderDeviceId, recipientId, payloadMessages }: StoreCiphertextInDbParams) => {
  try {
    const devices = await prisma.device.findMany({
      where: {
        OR: [
          {
            userId: recipientId
          },
          {
            userId: senderId,
          }
        ]
      },
    });

    const senderDevice = devices.find(d => d.deviceId === senderDeviceId && d.userId === senderId);

    if (!senderDevice) {
      throw new Error(`Sender device ${senderDeviceId} for user ${senderId} not found`);
    }

    const devicesData = payloadMessages
      .map(msg => {
        const recipient = devices.find(d => d.deviceId === msg.deviceId && d.userId === msg.recipientId);

        if (!recipient) return null;
        return {
          senderDeviceId: senderDevice.id,
          recipientDeviceId: recipient.id,
          ciphertext: msg.ciphertext,
        };
      })
      .filter(item => item !== null);

    const result = await prisma.chatMessage.create({
      data: {
        senderId,
        recipientId,
        devices: {
          createMany: {
            data: devicesData,
          },
        },
      },
      include: {
        devices: {
          include: {
            recipientDevice: true,
            senderDevice: true
          }
        },
      },
    });

    return result;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to store message in database");
  }
}

export const markMessageIdArrayAsRead = async ({ messageIds, recipientId }: MarkMessageIdArrayAsReadParams) => {
  try {
    await prisma.chatMessage.updateMany({
      where: {
        id: {
          in: messageIds
        },
        recipientId
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

export const getChatMessages = async ({
  userDeviceId,
  userId,
  otherUserId,
  before,
  count,
  since
}: GetChatMessagesParams) => {
  try {
    const result = await prisma.chatMessage.findMany({
      where: {
        AND: [
          {
            ...(userId && otherUserId
              ? {
                OR: [
                  {
                    senderId: userId,
                    recipientId: otherUserId
                  },
                  {
                    senderId: otherUserId,
                    recipientId: userId
                  }
                ]
              }
              : {
                OR: [
                  {
                    senderId: userId,
                  },
                  {
                    recipientId: userId
                  }
                ]
              }
            )
          },
          {
            ...(before && {
              sentAt: {
                lt: new Date(before)
              }
            })
          },
          {
            ...(since && {
              sentAt: {
                gt: new Date(since)
              }
            })
          }
        ]
      },
      include: {
        devices: {
          include: {
            recipientDevice: true,
            senderDevice: true
          }
        }
      },
      ...(count && { take: count }),
      orderBy: {
        sentAt: 'desc'
      }
    })

    const userDevice = await prisma.device.findUnique({
      where: {
        deviceId_userId: {
          userId,
          deviceId: userDeviceId
        },
      }
    });

    if (!userDevice) {
      throw new NotFoundError("userDevice");
    }

    const formatted: GetChatMessagesRes[] = result.map(msg => {
      const device = msg.devices.find(dev => dev.recipientDeviceId === userDevice.id);
      
      if (!device) {
        return null;
      }

      const tmp: GetChatMessagesRes = {
        id: msg.id,
        from: {
          userId: msg.senderId,
          deviceId: device.senderDevice.deviceId,
        },
        to: {
          userId: msg.recipientId,
        },
        ciphertext: device.ciphertext,
        sentAt: msg.sentAt.toISOString(),
        readAt: msg.readAt?.toISOString(),
        direction: msg.senderId === userId ? 'outgoing' : 'incoming',
        localUserId: userId,
        conversationKey: `${userId}-${otherUserId}`
      }

      return tmp;
    }).filter(msg => msg !== null);

    return formatted;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to get chat messages from database");
  }
}

export const getUpdatedReadReceipt = async ({ since, userId, otherUserId }: GetUpdatedReadReceipt) => {
  try {
    const result = await prisma.chatMessage.findMany({
      where: {
        senderId: userId,
        ...(otherUserId && { recipientId: otherUserId }),
        readAt: {
          ...(since && { gt: new Date(since)}) ,
          not: null
        }
      }
    })

    return result.map(msg => ({ messageId: msg.id, readAt: msg.readAt!.toISOString() }));
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to get updated read receipts from database");
  }
}