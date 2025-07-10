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
import { keys } from './keys';

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: keys.access.public,
  issuer: process.env.JWT_ISSUER || 'localhost',
  audience: process.env.JWT_AUDIENCE || 'localhost',
  algorithms: ['RS256'],
};

const strategy = new JwtStrategy(
  opts,
  async (payload: JwtPayload, done: VerifiedCallback) => {
    try {
      const user: User | null = await prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (user) {
        return done(null, { ...user, deviceId: payload.deviceId });
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
