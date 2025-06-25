import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../../lib/__mocks__/prisma";
import {
  getUserWithNormalizedProfileByUsername,
  getUserWithReviewsByUsername,
  getUserById,
  getUserByName,
  updateUserByUsername
} from "../../services/user.service";
import { mockUser, mockUserProfile, mockReview } from "../__mocks__/mock-prisma-models";
import { Role } from "@prisma/client";


vi.mock("../../lib/prisma", async () => {
  const actual = await vi.importActual("../../lib/__mocks__/prisma");
  return { ...actual };
});

describe("getUserWithNormalizedProfileByUsername", () => {
  beforeEach(() => vi.resetAllMocks());

  it("Returns normalized profile with image URL", async () => {
    const mockUserWithProfile = {
      ...mockUser,
      profile: mockUserProfile,
    }

    prisma.user.findUnique.mockResolvedValue(mockUserWithProfile);

    const result = await getUserWithNormalizedProfileByUsername({ username: "testuser" });

    expect(result.profile.profilePictureKey).toBe(`${process.env.R2_PUBLIC_ENDPOINT}/test.svg`);
    expect(result.username).toBe("testuser");
  });

  it("Returns default profile if none exists", async () => {
    const mockUser = {
      id: 2,
      email: "test2@example.com",
      username: "testuser2",
      role: Role.USER,
      createdAt: new Date(),
      userProfileId: null
    };

    prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await getUserWithNormalizedProfileByUsername({ username: "testuser2" });

    expect(result.profile.numberOfGigsCompleted).toBe(0);
    expect(result.profile.profilePictureKey).toBe(`${process.env.R2_PUBLIC_ENDPOINT}/default/Default_pfp.svg`);
  });

  it("Failure to find user in database should throw error", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(getUserWithNormalizedProfileByUsername({ username: "unknown" }))
      .rejects.toThrow("User does not exist");
  });

  it("Throws ServiceError if prisma fails", async () => {
    prisma.user.findUnique.mockRejectedValue(new Error("Database error"));

    await expect(getUserWithNormalizedProfileByUsername({ username: "error" }))
      .rejects.toThrow("Prisma error: Failed to get user from database");
  });
});

describe("getUserWithReviewsByUsername", () => {
  beforeEach(() => vi.resetAllMocks());

  it("Returns user with limited reviews", async () => {
    const mockUserWithReviews = {
      id: 1,
      username: "testuser",
      receivedReviews: [
        mockReview
      ]
    };

    prisma.user.findUnique.mockResolvedValue(mockUserWithReviews as any);

    const result = await getUserWithReviewsByUsername({ username: "testuser", NUMBER_OF_REVIEWS: 1 });

    expect(result.username).toBe("testuser");
    expect(result.receivedReviews).toHaveLength(1);
  });

  it("Failure to find user in database should throw error", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(getUserWithReviewsByUsername({ username: "unknown", NUMBER_OF_REVIEWS: 5 }))
      .rejects.toThrow("User does not exist");
  });

  it("Throws ServiceError if Prisma fails", async () => {
    prisma.user.findUnique.mockRejectedValue(new Error("db error"));

    await expect(getUserWithReviewsByUsername({ username: "err", NUMBER_OF_REVIEWS: 2 }))
      .rejects.toThrow("Prisma error: Failed to get user from database");
  });
});

describe("getUserById", () => {
  beforeEach(() => vi.resetAllMocks());

  it("Returns user if found", async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await getUserById({ id: 1 });
    expect(result).toEqual(mockUser);
  });

  it("Throws ServiceError if Prisma fails", async () => {
    prisma.user.findUnique.mockRejectedValue(new Error("database error"));

    await expect(getUserById({ id: 1 })).rejects.toThrow("Prisma error: Failed to get user from database");
  });
});

describe("getUserByName", () => {
  beforeEach(() => vi.resetAllMocks());

  it("Returns user if found", async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await getUserByName({ username: "testuser" });
    expect(result).toEqual(mockUser);
  });

  it("Throws ServiceError if Prisma fails", async () => {
    prisma.user.findUnique.mockRejectedValue(new Error("database error"));

    await expect(getUserByName({ username: "testuser" })).rejects.toThrow("Prisma error: Failed to get user from database");
  });
});

describe("updateUserByUsername", () => {
  beforeEach(() => vi.resetAllMocks());

  const mockParams = {
      id: 1,
      profileName: "testuser",
      bio: "test update bio",
      profilePictureKey: "profiles/test.svg"
    };

  it("Updates the user's profile", async () => {
    prisma.userProfile.update.mockResolvedValue(mockUserProfile);

    await updateUserByUsername(mockParams);

    expect(prisma.userProfile.update).toHaveBeenCalledWith({
      where: { userId: mockUser.id },
      data: {
        bio: "test update bio",
        profilePictureKey: "profiles/test.svg"
      }
    });
  });

  it("Throw ServiceError if prisma fails", async () => {
    prisma.userProfile.update.mockRejectedValue(new Error("Database error"));

    await expect(updateUserByUsername(mockParams)).rejects.toThrow("Prisma error: Failed to update user profile in database");
  });
});