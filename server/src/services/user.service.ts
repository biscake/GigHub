import { profile } from "console";
import { AppError } from "../errors/app-error";
import { NotFoundError } from "../errors/not-found-error";
import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";
import { getUserWithNormalizedProfileByUsernameParams, GetUserWithReviewsByUsernameParams, updateUserByProfileParams } from "../types/user";

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

    const profile = user?.profile ?? {
      bio: null,
      averageRating: null,
      numberOfGigsCompleted: 0,
      numberOfGigsPosted: 0,
      profilePictureKey: "default/Default_pfp.svg"
    }

    const profilePictureUrl = `${process.env.R2_PUBLIC_ENDPOINT}/${profile.profilePictureKey}`;

    return {
      ...user,
      profile: {
        ...profile,
        profilePictureKey: profilePictureUrl
      }
    }
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new ServiceError("Prisma", "Failed to get user from database");
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

    throw new ServiceError("Prisma", "Failed to get user from database");
  }
}

export const updateUserByUsername = async (params: updateUserByProfileParams) => {
  const { profileName, bio, profilePictureKey } = params;

  const user = await getUserWithNormalizedProfileByUsername({ username: profileName });
  try {
    await prisma.userProfile.update({
      where: {
        userId: user.id
      },
      data: {
        bio: bio,
        profilePictureKey: profilePictureKey
      }
    })
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to update user profile in database");
  }
}