export interface ChatMessage {
  ciphertext: string;
  deviceId: string;
  recipientId: number;
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

export interface ChatRecipientPayload {
  type: 'Chat';
  from: UserIdWithDeviceId;
  ciphertext: string;
  timestamp: Date;
}

export interface ChatSenderPayload extends ChatRecipientPayload {
  to: number;
}

export type ChatOnMessagePayload = ChatRecipientPayload | ChatSenderPayload;

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

export interface StoredMessage {
  id: string;
  from: {
    userId: number;
    deviceId: string;
  };
  to: {
    userId: number;
  };
  ciphertext: string;
  sentAt: string;
  readAt?: string;
  direction: "incoming" | "outgoing";
  localUserId: number;
  conversationKey: string;
}

export interface StoredConversationMeta {
  conversationKey: string;
  localUserId: number;
  lastFetchedAt?: string;
  oldestSyncedAt?: string;
  newestSyncedAt?: string;
}