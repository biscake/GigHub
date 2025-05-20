import { prisma } from "../lib/prisma";

export const cleanUpResetToken = async () => {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      },
    })

    console.log(`[Cron] Successfully cleaned up ${result.count} reset tokens`);
  } catch (error) {
    console.log("[Cron] Failed to clean up reset tokens", error);
  }
}