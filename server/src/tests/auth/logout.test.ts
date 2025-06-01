import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../../lib/__mocks__/prisma";
import { logout } from "../../services/auth.service";
import { mockRefreshTokenRecord } from "../__mocks__/mock-prisma-models";

const mockToken = "refresh_token";

vi.mock("../../lib/prisma", async () => {
  const actual = await vi.importActual("../../lib/__mocks__/prisma");
  return {
    ...actual,
  };
});

describe("Auth: logout", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Should revoke refresh token", async () => {
    prisma.refreshToken.update.mockResolvedValue({ ...mockRefreshTokenRecord, revoked: true });

    await logout({ token: mockToken });

    expect(prisma.refreshToken.update).toHaveBeenCalledWith({
      where: { token: mockToken },
      data: {
        revoked: true
      }
    })
  })

  it("Failure to update refresh token in database should throw error", async () => {
    prisma.refreshToken.update.mockRejectedValue(new Error("Database error"));

    await expect(logout({ token: mockToken })).rejects.toThrow("Database error");
  })
})