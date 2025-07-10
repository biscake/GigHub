import jwt from 'jsonwebtoken';
import { keys } from '../../config/keys';
import { getUserById } from '../../services/user.service';
import { JwtPayload } from '../../types/jwt-payload';
import { ExtWebSocket } from '../../types/ws';
import { Clients } from '../Clients';

export const handleAuth = async (accessToken: string, ws: ExtWebSocket, clients: Clients) => {
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(accessToken, keys.access.private, { algorithms: ['RS256'] }) as unknown as JwtPayload;
  } catch {
    ws.close(1008, "Invalid token");
    return;
  }

  try {
    const user = await getUserById({ id: decoded.sub }); 
    if (user) {
      ws.userId = user.id;
      ws.deviceId = decoded.deviceId;
      clients.add(user.id, decoded.deviceId, ws);
      console.log(`User ${user.id} connected on device ${decoded.deviceId}`);
      return;
    }

    ws.close(1008, "User not found");
    return;
  } catch {
    ws.close(1008, "Failed to retrieve user");
    return;
  }
}