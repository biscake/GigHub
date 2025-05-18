import { User } from '@prisma/client';
import { PassportStatic } from 'passport';
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptions,
  VerifiedCallback,
} from 'passport-jwt';
import { prisma } from '../lib/prisma';
import { JwtPayload } from '../types/jwt-payload';
import { getKeys } from './keys';

const keys = getKeys();

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: keys.access.public,
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
