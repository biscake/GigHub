import { updateLastRead } from '../../services/chat.service';
import { ReadPayload, ReadReceiptPayload } from '../../types/websocket-payload';
import { Clients } from '../Clients';

export const handleRead = async (userId: number, payload: ReadPayload, clients: Clients) => {
  try {
    const result = await updateLastRead({ userId, conversationKey: payload.conversationKey, lastRead: payload.lastRead });

    //If sender is online, send a message to sender to update read receipt
    const receiptPayload: ReadReceiptPayload = {
      type: 'Read-Receipt',
      conversationKey: result.conversationKey,
      lastRead: payload.lastRead
    }

    result.conversation.participants.map(user => {
      clients.sendAllUserDevice(user.userId , receiptPayload);
    })
  } catch (err) {
    console.error(err);
  }
}
