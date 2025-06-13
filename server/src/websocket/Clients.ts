import WebSocket from 'ws';

export class Clients {
  private clients: Map<number, Map<string, WebSocket>> = new Map();

  public add(userId: number, deviceId: string, ws: WebSocket) {
    let userSockets = this.clients.get(userId);
  
    if (!userSockets) {
      userSockets = new Map<string, WebSocket>();
      this.clients.set(userId, userSockets);
    }
  
    userSockets.set(deviceId, ws);
  }
  

  public getClientByUserId(userId: number) {
    return this.clients.get(userId);
  }

  public sendByUserId(userId: number, deviceId: string, message: Record<string, any>) {
    const userSockets = this.clients.get(userId);
    if (!userSockets) {
      return;
    }

    const socket = userSockets.get(deviceId);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }
}