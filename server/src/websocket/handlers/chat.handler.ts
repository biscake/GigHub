import { storeCiphertextInDb } from '../../services/chat.service';
import { ChatMessagePayload, ChatRecipientPayload, ChatSenderPayload } from '../../types/websocket-payload';
import { Clients } from '../Clients';

export const handleChat = async (userId: number, deviceId: string, payload: ChatMessagePayload, clients: Clients) => {
  const messages = payload.messages;

  try {
    const result = await storeCiphertextInDb({ senderId: userId, senderDeviceId: deviceId, recipientId: payload.to, payloadMessages: messages });
    messages.forEach(msg => {
      const device = result.devices.find(d => d.recipientDevice.deviceId === msg.deviceId);
      if (!device) {
        console.warn('No matching device found for message', msg);
        return;
      }
  
      // sync sender devices message
      if (msg.recipientId === userId) {
        clients.sendByUserId(userId, msg.deviceId, {
          type: "Chat",
          from: userId,
          to: payload.to
        } as ChatSenderPayload);
      }
  
      // if receipient is online, send a message to receipient
      if (payload.to === msg.recipientId) {
        clients.sendByUserId(payload.to, msg.deviceId, {
          type: "Chat",
          from: userId
        } as ChatRecipientPayload);
      }
    })
  } catch (err) {
    console.error(err);
  }
}
