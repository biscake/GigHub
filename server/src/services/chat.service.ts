import { AppError } from "../errors/app-error";
import { NotFoundError } from "../errors/not-found-error";
import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";
import {
  FindIfNotCreateConversationParams,
  GetAllLastReadParams,
  GetChatMessagesParams,
  GetChatMessagesRes,
  GetConversationByConversationKey,
  GetConversationMetaByKeyParams,
  GetConversationParticipantsAndKeysParams,
  GetExistingConversationsParams,
  GetLastReadParams,
  GetSenderIdByMessageIdParams,
  StoreCiphertextInDbByConversationKeyParams,
  StoreCiphertextInDbNewConversationParams,
  UpdateReadReceiptParams,
} from "../types/chat";

export const storeCiphertextInDbNewConversation = async ({ senderId, senderDeviceId, recipientId, payloadMessages, gigId }: StoreCiphertextInDbNewConversationParams) => {
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
    
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: senderId }, { userId: recipientId }]
        },
        gigId
      },
    });

    const result = await prisma.chatMessage.create({
      data: {
        senderId,
        devices: {
          createMany: {
            data: devicesData,
          },
        },
        conversationKey: conversation.conversationKey
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

export const storeCiphertextInDbByConversationKey = async ({ senderId, senderDeviceId, conversationKey, payloadMessages }: StoreCiphertextInDbByConversationKeyParams) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: {
        conversationKey,
      },
      include: {
        participants: true
      }
    });

    if (!conversation) throw new NotFoundError("Conversation")

    const participants = conversation?.participants.map(p => p.userId);

    const devices = await prisma.device.findMany({
      where: {
        userId: {
          in: participants
        }
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
        devices: {
          createMany: {
            data: devicesData,
          },
        },
        conversationKey: conversation.conversationKey
      },
      include: {
        devices: {
          include: {
            recipientDevice: true,
            senderDevice: true,
          }
        },
      },
    });

    const formatted= result.devices.map(msg => {
      const tmp = {
        id: msg.id,
        from: {
          userId: msg.senderDevice.userId,
          deviceId: msg.senderDevice.deviceId,
        },
        ciphertext: msg.ciphertext,
        sentAt: result.sentAt.toISOString(),
        direction: result.senderId === msg.recipientDevice.userId ? 'outgoing' : 'incoming',
        localUserId: msg.recipientDevice.userId,
        conversationKey: result.conversationKey,
        recipientDeviceId: msg.recipientDevice.deviceId
      }

      return tmp;
    }).filter(msg => msg !== null);

    return formatted
  } catch (err) {
    console.error(err)
    throw new ServiceError("Prisma", "Failed to store message in database");
  }
}

export const getConversationByConversationKey = async ({ conversationKey }: GetConversationByConversationKey) => {
  try {
    const result = await prisma.conversation.findUnique({
      where: { conversationKey }
    });

    return result;
  } catch {
    throw new ServiceError("Prisma", "Failed to get conversation");
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
  conversationKey,
  before,
  count,
  since
}: GetChatMessagesParams) => {
  try {
    let conversations;

    if (!conversationKey) {
      conversations = (await prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId
            }
          }
        }
      }));
    }

    const result = await prisma.chatMessage.findMany({
      where: {
        AND: [
          {
            ...(conversationKey
              ? {
                conversationKey
              }
              : {
                conversationKey: {
                  in: conversations?.map(c => c.conversationKey) ?? []
                }
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
        ciphertext: device.ciphertext,
        sentAt: msg.sentAt.toISOString(),
        direction: msg.senderId === userId ? 'outgoing' : 'incoming',
        localUserId: userId,
        conversationKey: msg.conversationKey
      }

      return tmp;
    }).filter(msg => msg !== null);

    return formatted;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to get chat messages from database");
  }
}

export const getExistingConversations = async ({ userId }: GetExistingConversationsParams) => {
  try {
    const result = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId
          }
        },
      },
      include: {
        gig: {
          include: {
            author: true
          }
        },
        participants: true
      }
    })

    const formatted = await Promise.all(result.map(async c => {
      return {
        conversationKey: c.conversationKey,
        participants: (await prisma.user.findMany({
          where: {
            id: {
              in: c.participants.map(p => p.userId)
            }
          }
        })).map(u => u.username),
        title: c.gig.title
      }
    }));

    return formatted;
  } catch {
    throw new ServiceError("Prisma", "Failed to get exisiting conversations for user");
  }
}

export const updateLastRead = async ({ lastRead, userId, conversationKey }: UpdateReadReceiptParams) => {
  try {
    const result = await prisma.chatLastRead.upsert({
      where: { 
        userId_conversationKey: {
          userId,
          conversationKey
        }
       },
      create: {
        userId,
        conversationKey,
        lastRead: new Date(lastRead)
      },
      update: { lastRead: new Date(lastRead) },
      include: {
        conversation: {
          include: {
            participants: true
          }
        }
      }
    })

    return result;
  } catch {
    throw new ServiceError("Prisma", "Failed to get update last read for user");
  }
}

export const getLastRead = async ({ conversationKey }: GetLastReadParams) => {
  try {
    const result = await prisma.chatLastRead.findMany({
      where: {
        conversationKey
      }
    })

    const formatted = result.map(r => {
      return {
        userId: r.userId,
        lastRead: r.lastRead.toISOString()
      }
    })

    return formatted;
  } catch {
    throw new ServiceError("Prisma", "Failed to get update last read for user");
  }
}

export const getAllLastRead = async ({ userId }: GetAllLastReadParams) => {
  try {
    const result = await prisma.chatLastRead.findMany({
      where: {
        conversation: {
          participants: {
            some: {
              userId
            }
          }
        }
      }
    });

    const formatted = result.map(r => {
      return {
        userId: r.userId,
        conversationKey: r.conversationKey,
        lastRead: r.lastRead.toISOString()
      }
    })

    return formatted;
  } catch {
    throw new ServiceError("Prisma", "Failed to get last reads");
  }
}

export const getConversationParticipantsAndKeys = async ({ conversationKey }: GetConversationParticipantsAndKeysParams) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { conversationKey },
      include: {
        participants: true
      }
    })

    const participants = conversation?.participants.map(p => p.userId);

    const publicKeys = await prisma.device.findMany({
      where: {
        userId: {
          in: participants ?? []
        }
      },
      include: {
        user: true
      }
    })

    const formatted = publicKeys.map(k => {
      return {
        userId: k.userId,
        username: k.user.username,
        ...(k.publicKey && { publicKey: JSON.parse(k.publicKey) }),
        deviceId: k.deviceId
      }
    })

    return formatted;
  } catch {
    throw new ServiceError("Prisma", "Failed to get conversation participants");
  }
}

export const findIfNotCreateConversation = async ({ gigId, userId, otherUserId }: FindIfNotCreateConversationParams) => {
  try {
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: {
        author: true
      }
    });

    if (!gig) throw new NotFoundError("Gig");

    const conversation = await prisma.conversation.findFirst({
      where: {
        gigId,
        AND: [
          {
            participants: {
              some: {
                userId: userId,
              },
            },
          },
          {
            participants: {
              some: {
                userId: otherUserId,
              },
            },
          },
        ],
      },
    });

    if (conversation) return { conversation, title: gig.title, gigAuthorUsername: gig.author.username };

    const result = await prisma.conversation.create({
      data: {
        gigId,
        participants: {
          create: [
            { userId },
            { userId: otherUserId }
          ]
        },
      },
      include: {
        participants: true
      }
    });

    const participantUsers = await prisma.user.findMany({
      where: { 
        id: {
          in: result.participants.map(p => p.userId)
        }
      }
    })
    
    return { conversation: result, title: gig.title, participants: participantUsers.map(p => p.username) };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    console.log(err)
    throw new ServiceError("Prisma", "Failed to find or create conversation");
  }
}

export const getConversationMetaByKey = async ({ userId, conversationKey }: GetConversationMetaByKeyParams) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: {
        conversationKey,
        participants: {
          some: {
            userId
          }
        }
      },
      include: {
        gig: {
          include: {
            author: true
          }
        },
        participants: true
      }
    })

    if (!conversation) throw new NotFoundError("Conversation")
    
    const participantUsers = await prisma.user.findMany({
      where: {
        id: {
          in: conversation.participants.map(p => p.userId)
        }
      }
    })

    return {
      title: conversation.gig.title,
      participants: participantUsers.map(p => p.username),
      conversationKey
    }
  } catch {
    throw new ServiceError("Prisma", "Failed to get conversation meta");
  }
}