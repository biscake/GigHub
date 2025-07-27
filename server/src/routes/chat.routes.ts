import { Router } from 'express';
import { getAllReadReceipts, getConversationMeta, getConversationParticipants, getConversations, getOrElseCreateConversation, syncMessages, syncReadReceipt } from '../controllers/chat.controller';
import { authenticateJWT } from '../middleware/auth/authenticate.middleware';

const router = Router();

router.get('/conversations', authenticateJWT, getConversations);

router.get('/conversations/gigs/:gigId/user/:otherUserId', authenticateJWT, getOrElseCreateConversation);

router.get('/conversations/read-receipt', authenticateJWT, getAllReadReceipts);

router.get('/conversations/:conversationKey/participants', authenticateJWT, getConversationParticipants)

router.get('/conversations/:conversationKey/meta', authenticateJWT, getConversationMeta);

router.get('/conversations/:conversationKey/messages', authenticateJWT, syncMessages);

router.get('/conversations/:conversationKey/read-receipt', authenticateJWT, syncReadReceipt);

export default router;
