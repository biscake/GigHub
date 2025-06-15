import { Application, Request } from 'express';
import { Clients } from './Clients';
import { WebsocketPayload } from '../types/websocket-payload';
import { handleChat } from './handlers/chat.handler';
import { handleRead } from './handlers/read.handler';
import { ExtWebSocket } from '../types/ws';
import { handleAuth } from './handlers/auth.handler';

const clients = new Clients();

export const setupWebSocket = (app: Application) => {
  app.ws('/ws', async (ws: ExtWebSocket, _req: Request) => {
    ws.on('message', (data) => {
      const payload = JSON.parse(data.toString()) as WebsocketPayload;
      const userId = ws.userId;

      switch (payload.type) {
        case 'Auth':
          return handleAuth(payload.accessToken, payload.deviceId, ws, clients);
        case 'Chat':
          if (!userId) return;
          return handleChat(userId, payload, clients);
        
        case 'Read':
          if (!userId) return;
          return handleRead(userId, payload, clients);
      }
    })
  })
}
