import { storeCiphertextInDb } from '../../services/chat.service';
import { ChatMessagePayload } from '../../types/websocket-payload';
import { Clients } from '../Clients';

export const handleChat = async (userId: number, payload: ChatMessagePayload, clients: Clients) => {
  await storeCiphertextInDb({ ciphertext: payload.ciphertext, senderId: userId, receipientId: payload.to, deviceId: payload.deviceId });
  console.log(payload);

  // if receipient is online, send a message to receipient
  clients.sendByUserId(payload.to, payload.deviceId, {
    type: "Chat",
    payload: {
      from: userId,
      ciphertext: payload.ciphertext,
      timestamp: new Date()
    }
  })

  console.log(payload);
}
