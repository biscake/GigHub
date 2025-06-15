import { storeCiphertextInDb } from '../../services/chat.service';
import { ChatMessagePayload, ChatReceipientPayload } from '../../types/websocket-payload';
import { Clients } from '../Clients';

export const handleChat = async (userId: number, payload: ChatMessagePayload, clients: Clients) => {
  if (!userId)
  await storeCiphertextInDb({ ciphertext: payload.ciphertext, senderId: userId, receipientId: payload.to, deviceId: payload.deviceId });

  // if receipient is online, send a message to receipient
  clients.sendByUserId(payload.to, payload.deviceId, {
    type: "Chat",
    payload: {
      from: { userId, deviceId: payload.deviceId },
      ciphertext: payload.ciphertext,
      timestamp: new Date()
    }
  } as ChatReceipientPayload)
}
