import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { resetDb } from "../helpers/resetDb";
import request from 'supertest';
import app from '../../app';
import { prisma } from "../../lib/prisma";
import { hashPlainPassword } from "../../utils/hash-password";

describe("Auth API", () => {
  beforeEach(async () => {
    await resetDb();

    const refreshToken = 'refresh_token';
    const deviceId = 'device_id';
    const userData = {
      username: 'user',
      email: 'user@email.com',
      password: 'Password123*',
    }
    const hashed = await hashPlainPassword(userData.password);

    await prisma.user.create({
      data: {
        id: 1,
        username: userData.username,
        email: userData.email,
        accounts: {
          create: {
            passwordHash: hashed,
            provider: 'credentials',
            providerAccountId: userData.email,
          }
        }
      }
    })

    await prisma.device.create({
      data: {
        id: 1,
        deviceId,
        userId: 1
      }
    })
    
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        revoked: false,
        deviceId: 1,
        expiresAt: new Date(new Date().getTime() + 14 * 60 * 60 * 1000)
      }
    })
  })

  afterAll(() => {
    prisma.$disconnect();
  })

  it('Registers a new user via controller', async () => {
    const userData = {
      username: 'newuser',
      email: 'newuser@email.com',
      password: 'Password123*',
      cpassword: 'Password123*',
    }

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .set('Idempotency-Key', 'idempotencyKey');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('User successfully registered');
    expect(response.body.user).toMatchObject({
      username: userData.username,
      email: userData.email
    });

    const userInDb = await prisma.user.findUnique({
      where: {
        username: userData.username,
        email: userData.email
      }
    })
    expect(userInDb).not.toBeNull();

    const stored = await prisma.idempotencyKey.findUnique({
      where: {
        id: 'idempotencyKey'
      }
    })
    expect(stored).not.toBeNull();
  })

  it('Login user via controller', async () => {
    const data = {
      username: 'user',
      password: 'Password123*',
      rememberMe: false,
      deviceId: "device_1"
    }

    const response = await request(app)
      .post('/api/auth/login')
      .send(data)
    
    const rawCookies = response.headers['set-cookie'];
    const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];
    expect(cookies).toBeDefined();
    const refreshToken = cookies.find(cookie => cookie.startsWith('refreshToken='))
    expect(refreshToken).toBeDefined();
  })

  it("Refresh token via controller", async () => {
    const refreshToken = 'refresh_token';
    const userData = {
      username: 'user',
      email: 'user@email.com',
      password: 'Password123*',
    }

    const body = {
      rememberMe: false
    }

    const response = await request(app)
      .post('/api/auth/refreshtoken')
      .send(body)
      .set('Cookie', [`refreshToken=${refreshToken}`])
      .set('Idempotency-Key', 'idempotencyKey');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Access token refreshed');
    expect(response.body.user).toMatchObject({
      username: userData.username,
      email: userData.email
    });

    // check if old refresh token is revoked
    const refreshTokenInDb = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      }
    })
    expect(refreshTokenInDb?.revoked).toBe(true);

    // check if new cookie with new refresh token is set
    const rawCookies = response.headers['set-cookie'];
    const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];
    expect(cookies).toBeDefined();
    const newRefreshToken = cookies.find(cookie => cookie.startsWith('refreshToken='))
    expect(newRefreshToken).not.toBe(refreshToken);
  })

  it("Logout user via controller", async () => {
    const refreshToken = 'refresh_token';

    const response = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', [`refreshToken=${refreshToken}`]);

    // check if old refresh token is revoked
    const refreshTokenInDb = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      }
    })

    // check if cookie is cleared
    expect(refreshTokenInDb?.revoked).toBe(true);
    const rawCookies = response.headers['set-cookie'];
    const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];
    const refreshTokenCookie = cookies.find(cookie => cookie.startsWith('refreshToken='))
    expect(refreshTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toMatch(/refreshToken=;/);
  })

  it("Reset user password via controller", async () => {
    const newPassword = 'NewPassword123*';
    const oldAccount = await prisma.account.findFirst({
      where: {
        userId: 1,
        provider: 'credentials',
        providerAccountId: 'user@email.com'
      }
    })

    const resetToken = 'reset_token';
    await prisma.resetToken.create({
      data: {
        userId: 1,
        token: resetToken,
        expiresAt: new Date(new Date().getTime() + 15 * 60 * 1000)
      }
    })

    const body = {
      resetToken,
      password: newPassword,
      cpassword: newPassword
    }

    const response = await request(app)
      .post('/api/auth/reset-password')
      .send(body)
      .set('Idempotency-Key', 'idempotencyKey');
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Password successfully reset');

    // check if hashed password is changed
    const account = await prisma.account.findFirst({
      where: {
        userId: 1,
        provider: 'credentials',
        providerAccountId: 'user@email.com'
      }
    })

    expect(account?.passwordHash).not.toBe(oldAccount?.passwordHash);
  })
})