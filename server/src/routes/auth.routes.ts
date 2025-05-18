import { Router } from 'express';
import {
  loginUserCredentials,
  logoutUser,
  refreshToken,
  registerUser
} from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate-request.middleware';
import { hashPassword } from '../utils/hash-password.util';
import { validateForm } from '../validators/auth.validator';

const router = Router();

router.post(
  '/register',
  validateForm,
  validateRequest,
  hashPassword,
  registerUser,
);

router.post('/login', loginUserCredentials);

router.post('/refreshtoken', refreshToken);

router.post('/logout', logoutUser);

export default router;
