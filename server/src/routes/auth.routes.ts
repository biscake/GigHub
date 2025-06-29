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
  idempotencyKey,             // Ensure HTTP requests are only processed once
  validateFormPassword,       // Validations for password and confirm password field of sign up form
  validateFormDuplicates,     // Validations for duplications of username and email field in database
  validateRequest,            // Throws validation error if any and stops request
  hashPassword,               // Hashes password and attaches it to req.pwHash
  registerUser,               // Controller for handling registration
);

router.post('/login',
  loginUserCredentials        // Controller for handling login
);

router.post('/refreshtoken',
  idempotencyKey,
  refreshToken                // Validate and rotates refresh token from req.cookies and store the response in database
);

router.post('/logout',
  logoutUser                  // Controller for handling logout
);

router.post('/request-reset',
  idempotencyKey,
  sendResetToken              // Controller for handling forgot password request, sending email with reset token to registered email
);

router.post(
  '/reset-password',
  idempotencyKey,
  validateFormPassword,
  validateRequest,
  hashPassword,
  resetUserPassword           // Controller for handling reset password request
);

export default router;
