import { User } from '@prisma/client';
import fs from 'fs';
import jsonwebtoken from 'jsonwebtoken';
import path from 'path';

const PRIV_KEY_PATH = process.env.PRIVATE_KEY_PATH;

if (!PRIV_KEY_PATH) {
  throw new Error('PRIVATE_KEY_PATH not defined in envrionment variables');
}

const PRIV_KEY = fs.readFileSync(path.resolve(PRIV_KEY_PATH), 'utf-8');

if (!PRIV_KEY) {
  throw new Error('PRIVATE_KEY not found');
}

export const issueJwt = (user: User) => {
  const { id } = user;

  const expiresIn = '14d';

  const payload = {
    sub: id,
    iat: Date.now(),
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn,
    algorithm: 'RS256',
  });

  return {
    token: 'Bearer ' + signedToken,
    expires: expiresIn,
  };
};
