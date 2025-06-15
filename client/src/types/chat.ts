export type ChatContextType = {
  sendMessageToUser: (message: string, receipientId: number, socket: WebSocket) => Promise<void>;
}