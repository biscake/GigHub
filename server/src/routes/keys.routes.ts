import { Router } from 'express';
import { idempotencyKey } from '../middleware/idempotency-key.middleware';
import { authenticateJWT } from '../middleware/auth/authenticate.middleware';
import { isOwnerOfDevice } from '../middleware/keys/is-owner-of-device.middleware';
import { getEncryptedPrivateKey, getPublicKey, postNewDevice } from '../controllers/key.controller';

const router = Router();

router.get('/private/:deviceId', authenticateJWT, isOwnerOfDevice, getEncryptedPrivateKey);

router.post('/', idempotencyKey, postNewDevice);

router.get('/public/:userId', getPublicKey);

export default router;
