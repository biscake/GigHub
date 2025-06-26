import { storeCiphertextInDbByConversationKey, storeCiphertextInDbNewConversation } from '../../services/chat.service';
import { ChatMessagePayload, ChatRecipientPayload, NewConversationPayload } from '../../types/websocket-payload';
import { Clients } from '../Clients';

export const handleChat = async (userId: number, deviceId: string, payload: ChatMessagePayload | NewConversationPayload, clients: Clients) => {
  const messages = payload.messages;

  try {
    let result: Awaited<ReturnType<typeof storeCiphertextInDbByConversationKey>> | Awaited<ReturnType<typeof storeCiphertextInDbNewConversation>>;
    
    if (payload.type === 'Chat') {
      result = await storeCiphertextInDbByConversationKey({ senderId: userId, senderDeviceId: deviceId, conversationKey: payload.conversationKey, payloadMessages: messages });
    }

    if (payload.type === 'New-Conversation') {
      result = await storeCiphertextInDbNewConversation({ senderId: userId, senderDeviceId: deviceId, recipientId: payload.to, payloadMessages: messages, gigId: payload.gigId });
    }

    messages.forEach(msg => {
      const device = result.devices.find(d => d.recipientDevice.deviceId === msg.deviceId);
      if (!device) {
        console.warn('No matching device found for message', msg);
        return;
      }
  
      clients.sendByUserId(msg.recipientId, msg.deviceId, {
        type: "Chat",
        conversationKey: result.conversationKey
      } as ChatRecipientPayload);
    })
  } catch (err) {
    console.error(err);
  }
}
