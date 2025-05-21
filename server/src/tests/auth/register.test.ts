import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../../lib/__mocks__/prisma";
import { register } from "../../services/auth.service";
import { mockUser } from "../__mocks__/mock-prisma-models";

const mockAccessToken = "access_token";
const mockRefreshToken = "refresh_token";

const mockPasswordHash = "testPasswordHash";

vi.mock("../../lib/prisma", async () => {
  const actual = await vi.importActual("../../lib/__mocks__/prisma");
  return {
    ...actual,
  };
});

vi.mock('../../utils/issue-tokens.util', () => ({
  issueRefreshToken: () => mockRefreshToken,
  issueAccessToken: () => mockAccessToken
}));

describe("Auth: register", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Should add user to database and issue access and refresh tokens", async () => {
    prisma.user.create.mockResolvedValue(mockUser);

    const result = await register({ username: mockUser.username, email: mockUser.email, pwHash: mockPasswordHash });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        username: mockUser.username,
        email: mockUser.email,
        accounts: {
          create: {
            provider: 'credentials',
            providerAccountId: mockUser.email,
            passwordHash: mockPasswordHash,
          },
        },
      },
    });

    expect(result).toEqual({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      user: mockUser
    })
  })

  it("Failure to create user in database should throw error", async () => {
    prisma.user.create.mockRejectedValue(new Error("Database error"));

    await expect(register({ username: mockUser.username, email: mockUser.email, pwHash: mockPasswordHash })).rejects.toThrow("Database error");
  })
})