import bcrypt from "bcryptjs";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { prisma } from "../../lib/__mocks__/prisma";
import { login } from "../../services/auth.service";
import { mockUser } from "../__mocks__/mock-prisma-models";

const mockAccessToken = "access_token";
const mockRefreshToken = "refresh_token";

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

type MockUserWithAccounts = typeof mockUser & {
  accounts: { passwordHash: string }[]
};

const mockPasswordHash = "testPasswordHash";

vi.mock("../../lib/prisma", async () => {
  const actual = await vi.importActual("../../lib/__mocks__/prisma");
  return {
    ...actual,
  };
});

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn()
  }
}));

vi.mock('../../utils/issue-tokens.util', () => ({
  issueRefreshToken: () => mockRefreshToken,
  issueAccessToken: () => mockAccessToken
}));

describe("Auth: login", () => {
  const fixedDate = new Date('2025-01-01T00:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("Should issue access and refresh token if credentials are valid", async () => {
    const mockUserWithAccounts: MockUserWithAccounts = { ...mockUser, accounts: [{ passwordHash: mockPasswordHash }] };
    
    prisma.user.findUnique.mockResolvedValue(mockUserWithAccounts);
    (bcrypt.compare as Mock).mockResolvedValue(true);

    const result = await login({ username: mockUser.username, password: "test_password" })

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        username: mockUser.username,
      },
      include: {
        accounts: {
          where: {
            provider: 'credentials',
          },
          select: {
            passwordHash: true,
          },
        },
      },
    });

    expect(prisma.refreshToken.create).toHaveBeenCalledWith({
      data: {
        token: mockRefreshToken,
        expiresAt: new Date(Date.now() + TWO_WEEKS_MS),
        userId: 1
      }
    });

    expect(result).toEqual({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      user: mockUserWithAccounts
    });
  })

  it("Invalid username should throw error", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(login({ username: mockUser.username, password: "test_password" })).rejects.toThrow("Invalid username or password");
  })

  it("Password hash missing should throw error", async () => {
    const mockUserWithAccounts: MockUserWithAccounts = { ...mockUser, accounts: [{ passwordHash: "" }] };
    prisma.user.findUnique.mockResolvedValue(mockUserWithAccounts);
    await expect(login({ username: mockUser.username, password: "test_password" })).rejects.toThrow("Invalid username or password");
  })

  it("Invalid password should throw error", async () => {
    const mockUserWithAccounts: MockUserWithAccounts = { ...mockUser, accounts: [{ passwordHash: mockPasswordHash }] };
    
    prisma.user.findUnique.mockResolvedValue(mockUserWithAccounts);
    (bcrypt.compare as Mock).mockResolvedValue(false);
    await expect(login({ username: mockUser.username, password: "test_password" })).rejects.toThrow("Invalid username or password");
  })

  it("Failure to create refresh token in database should throw error", async () => {
    const mockUserWithAccounts: MockUserWithAccounts = { ...mockUser, accounts: [{ passwordHash: mockPasswordHash }] };
    
    prisma.user.findUnique.mockResolvedValue(mockUserWithAccounts);
    prisma.refreshToken.create.mockRejectedValue(new Error("Database error"));

    (bcrypt.compare as Mock).mockResolvedValue(true);

    await expect(login({ username: mockUser.username, password: "test_password" })).rejects.toThrow("LoginService error: Failed to login user");
  })

  it("Failure to find user in database should throw error", async () => {
    prisma.user.findUnique.mockRejectedValue(new Error("Database error"));

    (bcrypt.compare as Mock).mockResolvedValue(true);

    await expect(login({ username: mockUser.username, password: "test_password" })).rejects.toThrow("LoginService error: Failed to login user");
  })
})