import { Application, Request } from 'express';
import WebSocket from 'ws';
import { Clients } from './Clients';
import { authenticateWS } from './middleware/auth.middleware';
import { WebsocketPayload } from '../types/websocket-payload';
import { handleChat } from './handlers/chat.handler';
import { handleRead } from './handlers/read.handler';
import { BadRequestError } from '../errors/bad-request-error';

const clients = new Clients();

export const setupWebSocket = (app: Application) => {
  app.ws('/ws', async (ws: WebSocket, req: Request) => {
    const params = new URLSearchParams(req.url?.split('?')[1]);
    const accessToken = params.get('token');
    const deviceId = params.get('deviceId');

    if (!accessToken) {
      throw new BadRequestError("Missing access token");
    }

    if (!deviceId) {
      throw new BadRequestError("Missing device id");
    }

    const user = await authenticateWS(accessToken);

    if (!user) {
      ws.close();
      return;
    }

    clients.add(user.id, deviceId, ws);
    console.log(`${user.username} connected with device ${deviceId}`);

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
