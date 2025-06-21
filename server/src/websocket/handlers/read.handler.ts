import { getMessagesByMessageIdArray, markMessageIdArrayAsRead } from '../../services/chat.service';
import { ReadPayload, ReadReceiptPayload } from '../../types/websocket-payload';
import { Clients } from '../Clients';

export const handleRead = async (recipientId: number, payload: ReadPayload, clients: Clients) => {
  try {
    await markMessageIdArrayAsRead({ messageIds: payload.messageIds, recipientId });

    const messages = await getMessagesByMessageIdArray({ messageIds: payload.messageIds });
    
    //If sender is online, send a message to sender to update read receipt
    messages.forEach(msg => {
      if (!msg.readAt) return;
      const payload: ReadReceiptPayload = {
        type: 'Read-Receipt',
        recipientId: msg.recipientId,
        messageId: msg.id,
        readAt: msg.readAt.toISOString()
      }

      clients.sendAllUserDevice(msg.senderId, payload);
      clients.sendAllUserDevice(msg.recipientId, payload);
    })
  } catch (err) {
    console.error(err);
  }
}
