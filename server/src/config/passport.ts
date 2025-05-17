import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptions,
  VerifiedCallback,
} from 'passport-jwt';

import { User } from '@prisma/client';
import fs from 'fs';
import { PassportStatic } from 'passport';
import path from 'path';
import { prisma } from '../lib/prisma';
import { JwtPayload } from '../types/jwt-payload';

const PUB_KEY_PATH = process.env.PUBLIC_KEY_PATH;

if (!PUB_KEY_PATH) {
  throw new Error('PUBLIC_KEY_PATH not defined in envrionment variables');
}

const PUB_KEY = fs.readFileSync(path.resolve(PUB_KEY_PATH), 'utf-8');

if (!PUB_KEY) {
  throw new Error('PUBLIC_KEY not found');
}

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  issuer: process.env.NODE_ENV === 'production' ? 'dummy.com' : 'localhost',
  audience:
    process.env.NODE_ENV === 'production' ? 'dummysite.com' : 'localhost',
  algorithms: ['RS256'],
};

const strategy = new JwtStrategy(
  opts,
  async (payload: JwtPayload, done: VerifiedCallback) => {
    try {
      const user: User | null = await prisma.user.findUnique({
        where: { id: payload.sub },
      });

      console.log(user);

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err as Error, null);
    }
  },
);

export default (passport: PassportStatic) => {
  passport.use(strategy);
};
