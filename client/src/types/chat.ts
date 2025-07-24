export interface ChatMessage {
  ciphertext: string;
  deviceId: string;
  recipientId: number;
}

export interface ChatMessagePayload {
  type: 'Chat';
  conversationKey: string;
  messages: ChatMessage[];
}

export interface ChatRecipientPayload {
  type: 'Chat';
  message: StoredMessage;
}

export type WebSocketOnMessagePayload = ChatRecipientPayload | ReadReceiptPayload;

export interface ReadPayload {
  type: 'Read';
  conversationKey: string;
  lastRead: string;
}

export interface ReadReceiptPayload {
  type: 'Read-Receipt';
  conversationKey: string;
  lastRead: string;
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
  ciphertext: string;
  sentAt: string;
  direction: "incoming" | "outgoing";
  localUserId: number;
  conversationKey: string;
}

export interface StoredConversationMeta {
  conversationKey: string;
  title?: string;
  participants?: string[];
  localUserId: number;
  lastFetchedAt?: string;
  oldestSyncedAt?: string;
  newestSyncedAt?: string;
}

export interface CachedDecryptedMessage {
  text: string | null;
  sentAt: string;
  direction: "incoming" | "outgoing";
  id: string;
}

export interface DecryptedChatMessage {
  id: string;
  sentAt: string;
  text: string;
  direction: string;
}

export interface LatestConversationMessage {
  latestMessage: CachedDecryptedMessage;
  conversationKey: string;
}

interface FetchResultOk {
  status: 'ok',
  messages: StoredMessage[]
}

interface FetchResultAlreadySynced {
  status: 'already_synced',
}

interface FetchResultFailed {
  status: 'failed'
}

export type FetchResult = FetchResultOk | FetchResultAlreadySynced | FetchResultFailed;

export interface Participant {
  userId: number;
  username: string;
  publicKey: JsonWebKey;
  deviceId: string;
}

export interface CachedConversationMeta {
  title?: string;
  participants?: string[];
}