import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";
import { GetChatMessagesParams, GetChatMessagesRes, GetSenderIdByMessageIdParams, MarkMessageIdArrayAsReadParams, StoreCiphertextInDbParams } from "../types/chat";

export const storeCiphertextInDb = async ({ senderId, senderDeviceId, recipientId, payloadMessages }: StoreCiphertextInDbParams) => {
  try {
    const result = await prisma.chatMessage.create({
      data: {
        senderId,
        recipientId,
        devices: {
          createMany: {
            data: payloadMessages.map(msg => ({
              senderDeviceId,
              recipientDeviceId: msg.deviceId,
              ciphertext: msg.ciphertext
            }))
          }
        }
      },
      include: {
        devices: true,
      }
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
          in: messageIds,
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
  originDeviceId,
  originUserId,
  targetUserId,
  beforeDateISOString,
  count,
  afterDateISOString
}: GetChatMessagesParams) => {
  try {
    const result = await prisma.chatMessage.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                senderId: originUserId,
                recipientId: targetUserId
              },
              {
                senderId: targetUserId,
                recipientId: originUserId
              }
            ]
          },
          {
            ...(beforeDateISOString && {
              sentAt: {
                lt: new Date(beforeDateISOString)
              }
            })
          },
          {
            ...(afterDateISOString && {
              sentAt: {
                gt: new Date(afterDateISOString)
              }
            })
          }
        ]
      },
      include: {
        devices: true
      },
      ...(count && { take: count }),
      orderBy: {
        sentAt: 'desc'
      }
    })

    const formatted: GetChatMessagesRes[] = result.map(msg => {
      const device = msg.devices.find(dev => dev.recipientDeviceId === originDeviceId);

      if (!device) {
        return null;
      }

      const tmp: GetChatMessagesRes = {
        id: device.id,
        from: {
          userId: msg.senderId,
          deviceId: device.senderDeviceId,
        },
        to: {
          userId: msg.recipientId,
        },
        ciphertext: device.ciphertext,
        sentAt: msg.sentAt.toISOString(),
        readAt: msg.readAt?.toISOString(),
        direction: msg.senderId === originUserId ? 'outgoing' : 'incoming',
        localUserId: originUserId,
        conversationKey: `${originUserId}-${targetUserId}`
      }

      return tmp;
    }).filter(msg => msg !== null);

    return formatted;
  } catch (err) {
    console.error(err)
    throw new ServiceError("Prisma", "Failed to get chat messages from database");
  }
}