import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { prisma } from "../../lib/__mocks__/prisma";
import { resetRequest } from "../../services/mailer.service";
import { mockResetTokenRecord, mockUser } from "../__mocks__/mock-prisma-models";
import { mockTransporter } from '../__mocks__/nodemailer';

const mockResetToken = "reset_token";

vi.mock("../../lib/prisma", async () => {
  const actual = await vi.importActual("../../lib/__mocks__/prisma");
  return {
    ...actual,
  };
});

vi.mock("nodemailer", async () => {
  const actual = await vi.importActual("../__mocks__/nodemailer");
  return {
    ...actual
  }
});

vi.mock('../../utils/issue-tokens.util', () => ({
  issueResetToken: () => mockResetToken 
}));


describe("Mailer: reset request", () => {
  const fixedDate = new Date('2025-01-01T00:00:00Z');
  
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
    vi.resetAllMocks();
  })

  it("Should issue a reset token and send email to user and revoke old tokens", async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    await resetRequest({ email: mockUser.email });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockUser.email   }
    })

    expect(prisma.resetToken.updateMany).toHaveBeenCalledWith({
      where: {
        userId: mockUser.id
      },
      data: {
        revoked: true
      }
    })

    expect(prisma.resetToken.create).toHaveBeenCalledWith({
      data: {
        token: mockResetToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        userId: mockUser.id
      }
    })

    expect(mockTransporter.sendMail).toHaveBeenCalledOnce();
  })

  it("User not found should throw error", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(resetRequest({ email: mockUser.email })).rejects.toThrow("Email not registered.");
  })

  it("Failure to find user in database should throw error", async () => {
    prisma.user.findUnique.mockRejectedValue(new Error("Database error"));

    await expect(resetRequest({ email: mockUser.email })).rejects.toThrow("Database error");
  })

  
  it("Failure to create reset token in database should throw error", async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.resetToken.create.mockRejectedValue(new Error("Database error"));

    await expect(resetRequest({ email: mockUser.email })).rejects.toThrow("Database error");
  })

  it("Failure to revoke old reset token in database should throw error", async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.resetToken.updateMany.mockRejectedValue(new Error("Database error"));

    await expect(resetRequest({ email: mockUser.email })).rejects.toThrow("Database error");
  })
})