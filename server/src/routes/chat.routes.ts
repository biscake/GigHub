import { Router } from 'express';
import { syncMessages, syncNewMessages, syncReadReceipt } from '../controllers/chat.controller';
import { authenticateJWT } from '../middleware/auth/authenticate.middleware';

const router = Router();

router.get('/conversations/messages', authenticateJWT, syncNewMessages);

router.get('/conversations/:otherUserId/messages', authenticateJWT, syncMessages);

router.get('/conversations/:otherUserId/read-receipt', authenticateJWT, syncReadReceipt);

export default router;
