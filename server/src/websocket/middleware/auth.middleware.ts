import jwt from 'jsonwebtoken';
import { keys } from '../../config/keys';
import { getUserById } from '../../services/user.service';
import { JwtPayload } from '../../types/jwt-payload';

export const authenticateWS = async (accessToken: string) => {
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(accessToken, keys.access.private, { algorithms: ['RS256'] }) as unknown as JwtPayload;
  } catch {
    return null;
  }

  try {
    const user = await getUserById({ id: decoded.sub }); 
    return user ?? null;
  } catch {
    return null;
  }
}