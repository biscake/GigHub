import { Router } from 'express';
import { getChatMessagesBetweenUsers } from '../controllers/chat.controller';
import { authenticateJWT } from '../middleware/auth/authenticate.middleware';
import { isOriginUserOfChat } from '../middleware/chat/is-origin-user';

const router = Router();

router.get('/conversations/:originUserId/:targetUserId', authenticateJWT, isOriginUserOfChat, getChatMessagesBetweenUsers);

export default router;
