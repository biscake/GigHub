import { Application, Request } from 'express';
import WebSocket from 'ws';
import { Clients } from './Clients';
import { authenticateWS } from './middleware/auth.middleware';
import { WebsocketPayload } from '../types/websocket-payload';
import { handleChat } from './handlers/chat.handler';
import { handleRead } from './handlers/read.handler';

const clients = new Clients();

export const setupWebSocket = (app: Application) => {
  app.ws('/ws', async (ws: WebSocket, req: Request) => {
    const user = await authenticateWS(req);

    if (!user) {
      ws.close();
      return;
    }

    clients.add(user.id, ws);
    console.log(`${user.username} connected`);

    ws.on('message', (data) => {
      const payload = JSON.parse(data.toString()) as WebsocketPayload;

      switch (payload.type) {
        case 'Chat':
          return handleChat(user.id, payload, clients);
        
        case 'Read':
          return handleRead(user.id, payload, clients);
      }
    })
  })
}
