import { ChatMessage } from "./websocket-payload";

export interface StoreCiphertextInDbNewConversationParams {
  senderId: number;
  recipientId: number;
  payloadMessages: ChatMessage[];
  senderDeviceId: string;
  gigId: number;
}

export interface StoreCiphertextInDbByConversationKeyParams {
  senderId: number;
  senderDeviceId: string;
  conversationKey: string;
  payloadMessages: ChatMessage[];
}

export interface MarkMessageIdArrayAsReadParams {
  messageIds: string[];
  recipientId: number;
}

export interface GetSenderIdByMessageIdParams {
  messageIds: string[];
}

export interface GetChatMessagesParams {
  userDeviceId: string;
  userId: number;
  conversationKey?: string;
  count?: number;
  before?: string;
  since?: string;
}

export interface GetChatMessagesRes {
  id: string;
  from: {
    userId: number;
    deviceId: string;
  };
  ciphertext: string;
  sentAt: string;
  readAt?: string;
  direction: "incoming" | "outgoing";
  localUserId: number;
  conversationKey: string;
}

export interface GetUpdatedReadReceipt {
  since: string;
  userId: number;
  otherUserId: number;
}

export interface GetMessagesSinceParams {
  since: string;
  userId: number;
  otherUserId: number;
}

export interface GetExistingConversationsParams {
  userId: number;
}

export interface UpdateReadReceiptParams {
  userId: number;
  conversationKey: string;
  lastRead: string;
}

export interface GetLastReadParams {
  conversationKey: string;
}

export interface GetAllLastReadParams {
  userId: number;
}

export interface GetConversationParticipantsAndKeysParams {
  conversationKey: string;
}

export interface GetConversationByConversationKey {
  conversationKey: string;
}

export interface UpsertConversationParams {
  gigId: number;
  userId: number;
<<<<<<< HEAD
}

export interface GetConversationMetaByKeyParams {
  userId: number;
  conversationKey: string;
=======
>>>>>>> d982e17c861b4407afd7f69c4b80c0e45148276a
}