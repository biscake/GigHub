import { Router } from 'express';
import { idempotencyKey } from '../middleware/idempotency-key.middleware';
import { authenticateJWT } from '../middleware/auth/authenticate.middleware';
import { getEncryptedPrivateKey, getPublicKey, postDeviceKeys } from '../controllers/key.controller';

const router = Router();

router.get('/private/:deviceId', authenticateJWT, getEncryptedPrivateKey);

router.post('/', idempotencyKey, postDeviceKeys);

router.get('/public/:userId', getPublicKey);

export default router;
