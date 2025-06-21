import { Router } from 'express';
import { createReview, editUserProfile, getProfileByUsername, getReceivedReviewsByUsername, getUserIdByUsername, getUsernameByUserId } from '../controllers/user.controller';
import { idempotencyKey } from '../middleware/idempotency-key.middleware';
import { authenticateJWT } from '../middleware/auth/authenticate.middleware';
import { isAuthorizedToModifyUser } from '../middleware/user/is-authorize-modify-user';
import { uploadSingleImage } from '../middleware/upload-assets.middleware';
import { createReviewValidators } from '../validators/user.validator';
import { validateRequest } from '../middleware/validate-request.middleware';
import { isAuthorizedToReview } from '../middleware/user/is-authorize-review';

const router = Router();

router.get('/:username/profile', getProfileByUsername);

router.get('/:username/reviews', getReceivedReviewsByUsername);

router.post('/:username/review',
  idempotencyKey,
  authenticateJWT,
  isAuthorizedToReview,
  createReviewValidators,
  validateRequest,
  createReview
)

router.put('/:username/profile/edit',
  idempotencyKey,
  authenticateJWT,
  uploadSingleImage,
  isAuthorizedToModifyUser,
  editUserProfile
)

router.get('/:username', getUserIdByUsername)

router.get('/userid/:id', getUsernameByUserId)

export default router;