interface ChatMessage {
  ciphertext: string;
  deviceId: string;
  recipientId: number;
}

export interface ChatMessagePayload {
  type: 'Chat';
  to: number;
  messages: ChatMessage[];
}

export interface ChatRecipientPayload {
  type: 'Chat';
  from: number;
  timestamp: string;
}

export interface ChatSenderPayload extends ChatRecipientPayload {
  to: number;
}

export interface ReadReceiptPayload {
  type: 'Read';
  messageIds: string[];
}

export interface AuthPayload {
  type: 'Auth';
  accessToken: string;
  deviceId: string;
}

export type WebsocketPayload = ChatMessagePayload | ReadReceiptPayload | AuthPayload;