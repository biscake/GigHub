import { Router } from 'express';
import { registerUser } from '../controllers/auth.controller';
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

export default router;
