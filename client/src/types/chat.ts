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

interface UserIdWithDeviceId {
  userId: number;
  deviceId: string;
}

interface ChatReceipientMessage {
  from: UserIdWithDeviceId;
  ciphertext: string;
  timestamp: Date;
}

export interface ChatReceipientPayload {
  type: 'Chat';
  payload: ChatReceipientMessage;
}

export interface ChatMessagePayload {
  type: 'Chat';
  to: number;
  ciphertext: string;
  deviceId: string;
}

export interface AuthPayload {
  type: 'Auth';
  accessToken: string;
  deviceId: string;
}