import { prisma } from "../../lib/prisma"

export const resetDb = async () => {
  try {
    await prisma.$transaction([
      prisma.chatMessageDevice.deleteMany(),
      prisma.chatLastRead.deleteMany(),
      prisma.participant.deleteMany(),
      prisma.chatMessage.deleteMany(),
      prisma.conversation.deleteMany(),
      prisma.refreshToken.deleteMany(),
      prisma.resetToken.deleteMany(),
      prisma.device.deleteMany(),
      prisma.gigApplication.deleteMany(),
      prisma.applicationStats.deleteMany(),
      prisma.gig.deleteMany(),
      prisma.review.deleteMany(),
      prisma.idempotencyKey.deleteMany(),
      prisma.account.deleteMany(),
      prisma.userProfile.deleteMany(),
      prisma.user.deleteMany(),
    ])
  } catch (err) {
    console.error("Failed to reset db", err)
    throw err
  }
}