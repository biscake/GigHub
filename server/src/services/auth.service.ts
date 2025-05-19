import bcrypt from 'bcryptjs';
import ValidationError from "../errors/validation-error";
import { prisma } from "../lib/prisma";
import { loginInput, logoutInput, registerInput, rotateTokenInput } from "../types/auth";
import { issueAccessToken, issueRefreshToken } from "../utils/issue-tokens.util";

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

export const register = async ({ username, email, pwHash }: registerInput) => {
  const user = await prisma.user.create({
    data: {
      username,
      email,
      accounts: {
        create: {
          provider: 'credentials',
          providerAccountId: email,
          passwordHash: pwHash,
        },
      },
    },
  });

  const accessToken = issueAccessToken(user);
  const refreshToken = issueRefreshToken();
  
  return { accessToken, refreshToken, user };
}

export const login = async ({ username, password }: loginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
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

  if (!user || !user.accounts[0]?.passwordHash) {
    throw new ValidationError('Invalid username or password', 406);
  }

  const isValid = await bcrypt.compare(
    password,
    user.accounts[0].passwordHash,
  );

  if (!isValid) {
    throw new ValidationError('Invalid username or password', 406);
  }

  const accessToken = issueAccessToken(user);
  const refreshToken = issueRefreshToken();

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      expiresAt: new Date(Date.now() + TWO_WEEKS_MS),
      userId: user.id
    }
  })

  return { accessToken, refreshToken, user };
}

export const rotateToken = async ({ refreshToken }: rotateTokenInput) => {
  if (!refreshToken) {
    throw new ValidationError('No refresh token', 401);
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      token: refreshToken
    },
    include: {
      user: true
    }
  })

  if (!storedToken || storedToken?.revoked || storedToken?.expiresAt < new Date()) {
    throw new ValidationError('Invalid refresh token', 403);
  }

  if (!storedToken?.user) {
    throw new Error("Missing user to create refresh token");
  }

  const newAccessToken = issueAccessToken(storedToken.user);
  const newRefreshToken = issueRefreshToken();

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { token: refreshToken },
      data: {
        revoked: true
      }
    }),
    prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + TWO_WEEKS_MS), 
        userId: storedToken.userId
      }
    })
  ])
  
  return { newAccessToken, newRefreshToken, user: storedToken.user };
}

export const logout = async ({ token }: logoutInput) => {
  await prisma.refreshToken.update({
    where: { token: token },
    data: {
      revoked: true
    }
  })
}