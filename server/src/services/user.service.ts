import { AppError } from "../errors/app-error";
import { NotFoundError } from "../errors/not-found-error";
import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";
import { GetUserByIdParams, getUserWithNormalizedProfileByUsernameParams, GetUserWithReviewsByUsernameParams } from "../types/user";

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

export const getUserWithReviewsByUsername = async ({ username, NUMBER_OF_REVIEWS }: GetUserWithReviewsByUsernameParams) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        receivedReviews: {
          take: NUMBER_OF_REVIEWS,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            comment: true,
            rating: true,
            createdAt: true,
            reviewer: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      throw new NotFoundError("User does not exist");
    }

    return user;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new ServiceError("Prisma", "Failed to create gig in database");
  }
}

export const getUserById = async ({ id }: GetUserByIdParams) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    return user;
  } catch {
    throw new ServiceError("Primsa", "Failed to get user from database");
  }
}