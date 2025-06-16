export interface ChatMessage {
  ciphertext: string;
  deviceId: string;
  receipientId: number;
}

export interface ChatMessagePayload {
  type: 'Chat';
  to: number;
  messages: ChatMessage[];
}

interface UserIdWithDeviceId {
  userId: number;
  deviceId: string;
}

export interface ChatReceipientPayload {
  type: 'Chat';
  from: UserIdWithDeviceId;
  ciphertext: string;
  timestamp: Date;
}

export interface ChatSenderPayload extends ChatReceipientPayload {
  to: number;
}

export type ChatOnMessagePayload = ChatReceipientPayload | ChatSenderPayload;

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