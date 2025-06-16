import { ChatMessage } from "./websocket-payload";

export interface StoreCiphertextInDbParams {
  senderId: number;
  receipientId: number;
  payloadMessages: ChatMessage[];
}

export interface MarkMessageIdArrayAsReadParams {
  messageIds: string[];
  receipientId: number;
}

export interface GetSenderIdByMessageIdParams {
  messageIds: string[];
}