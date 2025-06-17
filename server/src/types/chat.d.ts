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
  deviceId: string;
  senderId: number;
  receipientId: number;
  count: number;
}