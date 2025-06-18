import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";
import { GetChatMessagesParams, GetChatMessagesRes, GetSenderIdByMessageIdParams, MarkMessageIdArrayAsReadParams, StoreCiphertextInDbParams } from "../types/chat";

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
        OR: [
          {
            senderId: originUserId,
            receipientId: targetUserId,
            devices: {
              some: {
                OR: [
                  { senderDeviceId: originDeviceId },
                  { receipientDeviceId: originDeviceId }
                ]
              }
            }
          },
          {
            senderId: targetUserId,
            receipientId: originUserId,
            devices: {
              some: {
                receipientDeviceId: originDeviceId
              }
            }
          }
        ],
        ...(beforeDateISOString && {
          sentAt: {
            lt: new Date(beforeDateISOString)
          }
        }),
        ...(afterDateISOString && {
          sentAt: {
            gt: new Date(afterDateISOString)
          }
        })
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
      const tmp: GetChatMessagesRes = {
        id: msg.id,
        from: {
          userId: msg.senderId,
          deviceId: msg.devices[0].senderDeviceId,
        },
        to: {
          userId: msg.receipientId,
        },
        ciphertext: msg.devices[0].ciphertext,
        sentAt: msg.sentAt.toISOString(),
        readAt: msg.readAt?.toISOString(),
        direction: msg.senderId === originUserId ? 'outgoing' : 'incoming',
        localUserId: originUserId,
        conversationKey: `${originUserId}-${targetUserId}`
      }

      return tmp;
    })

    result.map(r => console.log(r.sentAt.toISOString()));
    return formatted;
  } catch {
    throw new ServiceError("Prisma", "Failed to get chat messages from database");
  }
}