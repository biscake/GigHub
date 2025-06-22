import { Router } from 'express';
import { syncMessagesBetweenUsers, syncReadReceiptBetweenUsers } from '../controllers/chat.controller';
import { authenticateJWT } from '../middleware/auth/authenticate.middleware';

const router = Router();

router.get('/conversations/:otherUserId/messages', authenticateJWT, syncMessagesBetweenUsers);

router.get('/conversations/:otherUserId/read-receipt', authenticateJWT, syncReadReceiptBetweenUsers);

export default router;
