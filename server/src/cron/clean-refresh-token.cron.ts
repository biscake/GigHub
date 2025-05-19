import { prisma } from "../lib/prisma";

export const cleanUpRefreshToken = async () => {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { revoked: true },
          {
            expiresAt: {
            lt: new Date()
          }}
        ]
      },
    })

    console.log(`[Cron] Successfully cleaned up ${result.count} refresh tokens`);
  } catch (error) {
    console.log("[Cron] Failed to clean up refresh tokens", error);
  }
}