export interface ChatMessagePayload {
  type: 'Chat';
  to: number;
  ciphertext: string;
}

export interface ReadReceiptPayload {
  type: 'Read';
  messageIds: string[];
}

export type WebsocketPayload = ChatMessagePayload | ReadReceiptPayload;