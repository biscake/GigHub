import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../../lib/__mocks__/prisma";
import { createReviewInDatabase, deleteReviewInDatabase } from "../../services/user.service";
import { mockReview } from "../__mocks__/mock-prisma-models";


vi.mock("../../lib/prisma", async () => {
  const actual = await vi.importActual("../../lib/__mocks__/prisma");
  return { ...actual };
});

describe("createReviewInDatabase", () => {
  beforeEach(() => vi.resetAllMocks());

  it("Creates review in database", async () => {
    prisma.review.create.mockResolvedValue(mockReview);

    const result = await createReviewInDatabase(mockReview);

    expect(result).toBe(mockReview);
  });

  it("Throws ServiceError if prisma fails", async () => {
    prisma.review.create.mockRejectedValue(new Error("database error"));

    await expect(createReviewInDatabase(mockReview))
      .rejects.toThrow("Prisma error: Failed to create review in database");
  });
});

describe("deleteReviewInDatabase", () => {
  beforeEach(() => vi.resetAllMocks());

  it("Deletes a review in database", async () => {
    const mockDeletedReview = {
      id: 2,
      comment: "test deleted",
      rating: 3,
      reviewerId: 4,
      revieweeId: 5,
      createdAt: new Date()
    };

    prisma.review.delete.mockResolvedValue(mockDeletedReview);

    const result = await deleteReviewInDatabase({ id: 2 });

    expect(prisma.review.delete).toHaveBeenCalledWith({
      where: { id: 2 }
    });

    expect(result).toEqual(mockDeletedReview);
  });

  it("Throw ServiceError if prisma fails", async () => {
    prisma.review.delete.mockRejectedValue(new Error("database error"));

    await expect(deleteReviewInDatabase({ id: 999 })).rejects.toThrow("Prisma error: Failed to delete review from database");
  });
});