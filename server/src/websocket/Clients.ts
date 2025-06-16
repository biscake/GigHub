import WebSocket from 'ws';

export class Clients {
  private clients: Map<number, WebSocket> = new Map();

  public add(userId: number, ws: WebSocket) {
    this.clients.set(userId, ws);
  } 

  public getClientByUserId(userId: number) {
    return this.clients.get(userId);
  }

  public sendByUserId(userId: number, message: Record<string, any>) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}