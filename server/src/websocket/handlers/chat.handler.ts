import { storeCiphertextInDbByConversationKey, storeCiphertextInDbNewConversation } from '../../services/chat.service';
import { ChatMessagePayload, ChatRecipientPayload } from '../../types/websocket-payload';
import { Clients } from '../Clients';

export const handleChat = async (userId: number, deviceId: string, payload: ChatMessagePayload, clients: Clients) => {
  const messages = payload.messages;

  try {
    const result = await storeCiphertextInDbByConversationKey({ senderId: userId, senderDeviceId: deviceId, conversationKey: payload.conversationKey, payloadMessages: messages });

    messages.forEach(msg => {
      const message = result.find(d => d.recipientDeviceId === msg.deviceId);
      if (!message) {
        console.warn('No matching device found for message', msg);
        return;
      }

      const { recipientDeviceId, ...messageWithoutRecipientDeviceId } = message;
  
      clients.sendByUserId(msg.recipientId, msg.deviceId, {
        type: "Chat",
        message: messageWithoutRecipientDeviceId
      } as ChatRecipientPayload);
    })
  } catch (err) {
    console.error(err);
  }
}
