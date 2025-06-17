import { storeCiphertextInDb } from '../../services/chat.service';
import { ChatMessagePayload, ChatReceipientPayload, ChatSenderPayload } from '../../types/websocket-payload';
import { Clients } from '../Clients';

export const handleChat = async (userId: number, deviceId: string, payload: ChatMessagePayload, clients: Clients) => {
  const messages = payload.messages;

  await storeCiphertextInDb({ senderId: userId, senderDeviceId: deviceId, receipientId: payload.to, payloadMessages: messages });

  messages.forEach(msg => {
    // sync sender devices message
    if (msg.receipientId === userId) {
      clients.sendByUserId(userId, msg.deviceId, {
        type: "Chat",
        from: { userId, deviceId },
        ciphertext: msg.ciphertext,
        timestamp: new Date(),
        to: payload.to
      } as ChatSenderPayload);
    }

    // if receipient is online, send a message to receipient
    if (payload.to === msg.receipientId) {
      clients.sendByUserId(payload.to, msg.deviceId, {
        type: "Chat",
        from: { userId, deviceId },
        ciphertext: msg.ciphertext,
        timestamp: new Date()
      } as ChatReceipientPayload);
    }
  })
}
