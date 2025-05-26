import { AppError } from "../errors/app-error";
import { NotFoundError } from "../errors/not-found-error";
import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";
import { getUserWithNormalizedProfileByUsernameParams } from "../types/user";

export const getUserWithNormalizedProfileByUsername = async ({ username }: getUserWithNormalizedProfileByUsernameParams) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
      }
    });

    if (!user) {
      throw new NotFoundError("User does not exist");
    }

    return {
      ...user,
      profile: user?.profile ?? {
        bio: null,
        averageRating: null,
        numberOfGigsCompleted: 0,
        numberOfGigsPosted: 0,
        profilePictureKey: null
      }
    };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new ServiceError("Prisma", "Failed to create gig in database");
  }
}