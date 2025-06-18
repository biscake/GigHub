import { ChatMessage } from "./websocket-payload";

export interface StoreCiphertextInDbParams {
  senderId: number;
  receipientId: number;
  payloadMessages: ChatMessage[];
  senderDeviceId: string;
}

export interface MarkMessageIdArrayAsReadParams {
  messageIds: string[];
  receipientId: number;
}

export interface GetSenderIdByMessageIdParams {
  messageIds: string[];
}

export interface GetChatMessagesParams {
  originDeviceId: string;
  originUserId: number;
  targetUserId: number;
  count?: number;
  beforeDateISOString?: string;
  afterDateISOString?: string;
}

export interface GetChatMessagesRes {
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