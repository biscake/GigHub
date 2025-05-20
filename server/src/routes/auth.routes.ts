import { Router } from 'express';
import {
  loginUserCredentials,
  logoutUser,
  refreshToken,
  registerUser,
  resetUserPassword
} from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate-request.middleware';
import { hashPassword } from '../middleware/hash-password.middleware';
import { validateFormPassword, validateFormDuplicates } from '../validators/auth.validator';
import { sendResetToken } from '../controllers/mailer.controller';

const router = Router();

router.post(
  '/register',
  validateFormPassword,
  validateFormDuplicates,
  validateRequest,
  hashPassword,
  registerUser,
);

router.post('/login', loginUserCredentials);

router.post('/refreshtoken', refreshToken);

router.post('/logout', logoutUser);

router.post('/request-reset', sendResetToken);

router.post(
  '/reset-password',
  validateFormPassword,
  validateRequest,
  hashPassword,
  resetUserPassword
);

export default router;
