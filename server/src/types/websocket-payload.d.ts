export interface ChatMessagePayload {
  type: 'Chat';
  to: number;
  ciphertext: string;
  deviceId: string;
}

export interface ReadReceiptPayload {
  type: 'Read';
  messageIds: string[];
}

export type WebsocketPayload = ChatMessagePayload | ReadReceiptPayload;