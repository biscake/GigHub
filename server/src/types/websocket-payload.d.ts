interface ChatMessage {
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
  conversationKey: string;
}

export interface NewConversationCreatedPayload {
  type: 'Chat';
  conversationKey: string;
  gigId: number;
}

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


export type WebsocketPayload = NewConversationPayload | ChatMessagePayload | ReadPayload | AuthPayload;
