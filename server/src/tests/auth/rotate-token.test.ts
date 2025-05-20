import { Role } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../../lib/__mocks__/prisma";
import { rotateToken } from "../../services/auth.service";

const TWO_WEEKS_MS = 1000 * 60 * 60 * 24 * 14;

const mockOldRefreshToken = "old_refresh_token";
const mockNewRefreshToken = "new_refresh_token";
const mockNewAccessToken = "new_access_token";

const mockUser = {
  id: 1,
  email: "test@example.com",
  username: "testuser",
  role: Role.USER,
  createdAt: new Date(),
};

const mockOldToken = {
  id: '1',
  token: mockOldRefreshToken,
  revoked: false,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + TWO_WEEKS_MS),
  userId: 1,
  user: mockUser,
};

const mockNewToken = {
  id: '2',
  token: mockNewRefreshToken,
  revoked: false,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + TWO_WEEKS_MS),
  userId: 1
}

vi.mock("../../lib/prisma", async () => {
  const actual = await vi.importActual("../../lib/__mocks__/prisma");
  return {
    ...actual,
  };
});

vi.mock('../../utils/issue-tokens.util', () => ({
  issueRefreshToken: () => mockNewRefreshToken,
  issueAccessToken: () => mockNewAccessToken
}));

describe("Auth: Rotate refresh token", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Should rotate the token if valid", async () => {    
    prisma.refreshToken.findUnique.mockResolvedValue(mockOldToken);
    
    prisma.refreshToken.update.mockResolvedValue({
      ...mockOldToken,
      revoked: true
    })

    prisma.refreshToken.create.mockResolvedValue(mockNewToken);

    prisma.$transaction.mockResolvedValue([
      { ...mockOldToken, revoked: true },
      mockNewToken 
    ]);

    const result = await rotateToken({ refreshToken: mockOldRefreshToken });

    expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
      where: { token: mockOldRefreshToken },
      include: { user: true },
    });

    expect(prisma.refreshToken.update).toHaveBeenCalledWith({
      where: { token: mockOldRefreshToken },
      data: { revoked: true },
    });

    expect(prisma.refreshToken.create).toHaveBeenCalledWith({
      data: {
        token: mockNewRefreshToken,
        expiresAt: expect.any(Date),
        userId: mockUser.id,
      },
    });

    expect(prisma.$transaction).toHaveBeenCalledWith([
      expect.any(Promise),
      expect.any(Promise),
    ]);

    expect(result).toEqual({
      newAccessToken: mockNewAccessToken,
      newRefreshToken: mockNewRefreshToken,
      user: mockUser,
    });
  })

  it("Transaction failure should throw error", async () => {
    prisma.refreshToken.update.mockResolvedValue({
      ...mockOldToken,
      revoked: true
    })
    prisma.refreshToken.create.mockResolvedValue(mockNewToken);

    prisma.refreshToken.findUnique.mockResolvedValue(mockOldToken);

    prisma.$transaction.mockRejectedValue(new Error("Database error"));

    await expect(rotateToken({ refreshToken: mockOldRefreshToken })).rejects.toThrow("Database error");
  })

  it("Refresh token missing should throw error", async () => {
    await expect(rotateToken({ refreshToken: "" })).rejects.toThrow("No refresh token");
  })

  it("Token not found in database should throw error", async () => {
    prisma.refreshToken.findUnique.mockResolvedValue(null);
    await expect(rotateToken({ refreshToken: mockOldRefreshToken })).rejects.toThrow("Invalid refresh token");
  })

  it("Revoked token should throw error", async () => {
    const mockRevokedToken = {
      ...mockOldToken,
      revoked: true
    }

    prisma.refreshToken.findUnique.mockResolvedValue(mockRevokedToken);
    await expect(rotateToken({ refreshToken: mockOldRefreshToken })).rejects.toThrow("Invalid refresh token");
  })

  it("Expired token should throw error", async () => {
    const mockExpiredToken = {
      ...mockOldToken,
      expiresAt: new Date(Date.now() - 1000000)
    }

    prisma.refreshToken.findUnique.mockResolvedValue(mockExpiredToken);
    await expect(rotateToken({ refreshToken: mockOldRefreshToken })).rejects.toThrow("Invalid refresh token");
  })

  it("Token without user should throw error", async () => {
    const mockRefreshToken = { ...mockOldToken, user: null };
    prisma.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);
    await expect(rotateToken({ refreshToken: mockOldRefreshToken })).rejects.toThrow("Missing user to create refresh token");
  })
})