import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { resetDb } from "../helpers/resetDb";
import request from 'supertest';
import app from '../../app';
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { hashPlainPassword } from "../../utils/hash-password";

describe("Auth API", () => {
  beforeEach(() => {
    resetDb();
  })

  afterAll(() => {
    prisma.$disconnect();
  })

  it('Registers a new user via controller', async () => {
    const userData = {
      username: 'user',
      email: 'user@email.com',
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
    const password = 'Password123*';
    const hashed = await hashPlainPassword(password);
    // create user
    await prisma.user.create({
      data: {
        username: 'user',
        email: 'user@email.com',
        accounts: {
          create: {
            passwordHash: hashed,
            provider: 'credentials',
            providerAccountId: 'user@email.com',
          }
        }
      }
    })

    const data = {
      username: 'user',
      password: password,
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
})