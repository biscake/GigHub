import { Router } from 'express';
import {
  loginUserCredentials,
  logoutUser,
  refreshToken,
  registerUser,
  resetUserPassword
} from '../controllers/auth.controller';
import { sendResetToken } from '../controllers/mailer.controller';
import { hashPassword } from '../middleware/auth/hash-password.middleware';
import { idempotencyKey } from '../middleware/idempotency-key.middleware';
import { validateRequest } from '../middleware/validate-request.middleware';
import { validateFormDuplicates, validateFormPassword } from '../validators/auth.validator';

const router = Router();

router.post(
  '/register',
  idempotencyKey,
  validateFormPassword,
  validateFormDuplicates,
  validateRequest,
  hashPassword,
  registerUser,
);

router.post('/login', loginUserCredentials);

router.post('/refreshtoken', idempotencyKey, refreshToken);

router.post('/logout', logoutUser);

router.post('/request-reset', idempotencyKey, sendResetToken);

router.post(
  '/reset-password',
  idempotencyKey,
  validateFormPassword,
  validateRequest,
  hashPassword,
  resetUserPassword
);

export default router;
