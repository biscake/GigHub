import { getMessagesByMessageIdArray, markMessageIdArrayAsRead } from '../../services/chat.service';
import { ReadReceiptPayload } from '../../types/websocket-payload';
import { Clients } from '../Clients';

export const handleRead = async (receipientId: number, payload: ReadReceiptPayload, clients: Clients) => {
  await markMessageIdArrayAsRead({ messageIds: payload.messageIds, receipientId });

  const messages = await getMessagesByMessageIdArray({ messageIds: payload.messageIds });

  //If sender is online, send a message to sender to update read receipt
  messages.forEach(msg => clients.sendByUserId(msg.senderId, {
    type: 'read-receipt',
    payload: {
      messageId: msg.id,
      readAt: new Date()
    }
  }))
}
