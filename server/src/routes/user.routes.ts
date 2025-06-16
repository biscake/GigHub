import { Router } from 'express';
import { editUserProfile, getProfileByUsername, getReceivedReviewsByUsername } from '../controllers/user.controller';
import { idempotencyKey } from '../middleware/idempotency-key.middleware';
import { authenticateJWT } from '../middleware/auth/authenticate.middleware';
import { isAuthorizedToModifyUser } from '../middleware/user/is-authorize-modify-user';
import { uploadSingleImage } from '../middleware/upload-assets.middleware';

const router = Router();

router.get('/:username/profile', getProfileByUsername);

router.get('/:username/reviews', getReceivedReviewsByUsername);

router.put('/:username/profile/edit',
  idempotencyKey,
  authenticateJWT,
  uploadSingleImage,
  isAuthorizedToModifyUser,
  editUserProfile
)

export default router;