import { Role } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../../lib/__mocks__/prisma";
import { resetPassword, rotateToken } from "../../services/auth.service";

const mockUser = {
  id: 1,
  email: "test@example.com",
  username: "testuser",
  role: Role.USER,
  createdAt: new Date(),
};

const mockResetToken = "reset_token";
const mockPwHash = "pw_hash";

const mockResetTokenRecord = {
  id: "1",
  token: mockResetToken,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  userId: 1,
  user: mockUser
}

vi.mock("../../lib/prisma", async () => {
  const actual = await vi.importActual("../../lib/__mocks__/prisma");
  return {
    ...actual,
  };
});

describe("Auth: reset password", () => { 
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Should update password hash in database if token is valid", async () => {
    prisma.resetToken.findUnique.mockResolvedValue(mockResetTokenRecord);
    prisma.user.findUnique.mockResolvedValue(mockUser);

    await resetPassword({ resetToken: mockResetToken, pwHash: mockPwHash });
    
    expect(prisma.resetToken.findUnique).toHaveBeenCalledWith({
      where: { token: mockResetToken }
    })

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockResetTokenRecord.userId }
    })

    expect(prisma.account.updateMany).toHaveBeenCalledWith({
      where: { 
        providerAccountId: mockUser.email, 
        provider: 'credentials'
      },
      data: {
        passwordHash: mockPwHash
      }
    })
  })

  it("Reset token missing should throw error", async () => {
    await expect(resetPassword({ resetToken: "", pwHash: mockPwHash })).rejects.toThrow("Invalid reset token");
  })

  it("Token not found in database should throw error", async () => {
    prisma.resetToken.findUnique.mockResolvedValue(null);
    await expect(resetPassword({ resetToken: mockResetToken, pwHash: mockPwHash })).rejects.toThrow("Invalid reset token");
  })

  it("Expired token should throw error", async () => {
    const mockExpiredToken = {
      ...mockResetTokenRecord,
      expiresAt: new Date(Date.now() - 1000000)
    }

    prisma.resetToken.findUnique.mockResolvedValue(mockExpiredToken);
    await expect(resetPassword({ resetToken: mockResetToken, pwHash: mockPwHash })).rejects.toThrow("Invalid reset token");
  })

  it("Token without user should throw error", async () => {
    const mockResetTokenNoUser = { ...mockResetTokenRecord, user: null };
    prisma.resetToken.findUnique.mockResolvedValue(mockResetTokenNoUser);

    await expect(resetPassword({ resetToken: mockResetToken, pwHash: mockPwHash })).rejects.toThrow("User not found");
  })

  it("Failure to find user in database should throw error", async () => {
    prisma.resetToken.findUnique.mockResolvedValue(mockResetTokenRecord);
    prisma.user.findUnique.mockRejectedValue(new Error("Database error"));

    await expect(resetPassword({ resetToken: mockResetToken, pwHash: mockPwHash })).rejects.toThrow("Database error");
  })

  it("Failure to find reset token record in database should throw error", async () => {
    prisma.resetToken.findUnique.mockRejectedValue(new Error("Database error"));
    prisma.user.findUnique.mockResolvedValue(mockUser);

    await expect(resetPassword({ resetToken: mockResetToken, pwHash: mockPwHash })).rejects.toThrow("Database error");
  })

  it("Failure to update user password hash in database should throw error", async () => {
    prisma.resetToken.findUnique.mockResolvedValue(mockResetTokenRecord);
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.account.updateMany.mockRejectedValue(new Error("Database error"));

    await expect(resetPassword({ resetToken: mockResetToken, pwHash: mockPwHash })).rejects.toThrow("Database error");
  })
})