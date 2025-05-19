import { User } from '@prisma/client';
import crypto from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import { getKeys } from '../config/keys';

const keys = getKeys();

export const issueAccessToken = (user: User) => {
  const { id, username } = user;

  const expiresIn = '15m';

  const payload = {
    sub: id,
    username,
    iat: Date.now(),
  };

  const signedToken = jsonwebtoken.sign(payload, keys.access.private, {
    expiresIn,
    algorithm: 'RS256',
  });

  return signedToken;
};

export const issueRefreshToken = () => {
  const refreshToken = crypto.randomBytes(40).toString('hex');

  return refreshToken;
}
