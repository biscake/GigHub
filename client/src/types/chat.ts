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

export interface ChatRecipientPayload {
  type: 'Chat';
  from: number;
  timestamp: string;
}

export interface ChatSenderPayload extends ChatRecipientPayload {
  to: number;
}

export type WebSocketOnMessagePayload = ChatRecipientPayload | ChatSenderPayload | ReadReceiptPayload;

export interface ReadPayload {
  type: 'Read';
  messageIds: string[];
}

export interface ReadReceiptPayload {
  type: 'Read-Receipt';
  messageId: string;
  readAt: string;
  recipientId: number;
}

export interface AuthPayload {
  type: 'Auth';
  accessToken: string;
  deviceId: string;
}

export type WebSocketMessagePayload = ChatMessagePayload | ReadPayload | AuthPayload;

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
  lastReadReceiptUpdatedAt?: string;
}

export interface CachedDecryptedMessage {
  text: string;
  sentAt: string;
  readAt?: string;
  direction: "incoming" | "outgoing";
  id: string;
}

export interface DecryptedChatMessage {
  id: string;
  sentAt: string;
  readAt?: string;
  text: string;
  direction: string;
}

export interface LatestConversationMessage {
  otherUserId: number;
  latestMessage: CachedDecryptedMessage;
  conversationKey: string
}
