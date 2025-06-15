import { WebSocket } from 'ws';

interface ExtWebSocket extends WebSocket {
  userId?: number;
  deviceId?: string;
}