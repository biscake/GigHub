import { Router } from 'express';
import { syncMessagesBetweenUsers, syncReadReceiptBetweenUsers } from '../controllers/chat.controller';
import { authenticateJWT } from '../middleware/auth/authenticate.middleware';
import { isOriginUserOfChat } from '../middleware/chat/is-origin-user';

const router = Router();

router.get('/conversations/:originUserId/:targetUserId/messages', authenticateJWT, isOriginUserOfChat, syncMessagesBetweenUsers);

router.get('/conversations/:originUserId/:targetUserId/read-receipt', authenticateJWT, isOriginUserOfChat, syncReadReceiptBetweenUsers);

export default router;
