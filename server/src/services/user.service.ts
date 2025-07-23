import { profile } from "console";
import { AppError } from "../errors/app-error";
import { NotFoundError } from "../errors/not-found-error";
import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";
import { BadRequestError } from "../errors/bad-request-error";
import { GetNormalizedProfilesParams, deleteReviewInDatabaseParams, createReviewInDatabaseParams, GetUserByIdParams, GetUserByNameParams, getUserWithNormalizedProfileByUsernameParams, GetUserWithReviewsByUsernameParams, updateUserByProfileParams } from "../types/user";

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
  const { id, profileName, bio, profilePictureKey } = params;

  try {
    await prisma.userProfile.update({
      where: {
        userId: id
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

export const getUserById = async ({ id }: GetUserByIdParams) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    return user;
  } catch {
    throw new ServiceError("Prisma", "Failed to get user from database");
  }
}

export const getUserByName = async ({ username }: GetUserByNameParams) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    return user;
  } catch {
    throw new ServiceError("Prisma", "Failed to get user from database");
  }
}

export const createReviewInDatabase = async (review: createReviewInDatabaseParams) => {
  try {
    const result = await prisma.review.create({
      data: {
        comment: review.comment,
        rating: Number(review.rating),
        reviewerId: review.reviewerId,
        revieweeId: review.revieweeId,
      }
    });

    return result;
  } catch (err) {
    if (err instanceof BadRequestError) {
      throw err;
    }

    throw new ServiceError("Prisma", "Failed to create review in database");
  }
}

export const getUserData = async ({ search }: GetNormalizedProfilesParams) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: search,
          mode: 'insensitive'
        }
      },
      include: {
        profile: true,
      },
      take: 30
    });

    const formatted = users.map(user => {
      const profile = user.profile ?? {
        bio: null,
        averageRating: null,
        numberOfGigsCompleted: 0,
        numberOfGigsPosted: 0,
        profilePictureKey: "default/Default_pfp.svg"
      }
    
      return {
        username: user.username,
        userId: user.id,
        profilePictureUrl: `${process.env.R2_PUBLIC_ENDPOINT}/${profile.profilePictureKey}`,
        bio: profile.bio
      }
    })

    return formatted;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to get user from database");
  }
}

export const deleteReviewInDatabase = async ({ id }: deleteReviewInDatabaseParams) => {
  try {
    const result = await prisma.review.delete({
      where: {
        id: id
      }
    })

    return result;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to delete review from database");
  }
}

export const updateNumberPostedGigByUsername = async ({ id }: GetUserByIdParams) => {
  try {
    const result = await prisma.userProfile.update({
      where: {
        userId: id
      },
      data: {
        numberOfGigsPosted: {
          increment: 1
        }
      }
    });
    
    return result;
  } catch {
    throw new ServiceError("Prisma", "Failed to update user profile in database");
  }
}