import { Router } from 'express';
import { editUserProfile, getProfileByUsername, getReceivedReviewsByUsername, getUsernameByUserId, searchUser } from '../controllers/user.controller';
import { idempotencyKey } from '../middleware/idempotency-key.middleware';
import { authenticateJWT } from '../middleware/auth/authenticate.middleware';
import { isAuthorizedToModifyUser } from '../middleware/user/is-authorize-modify-user';
import { uploadSingleImage } from '../middleware/upload-assets.middleware';

const router = Router();

router.get('/', searchUser);

router.get('/:username/profile', getProfileByUsername);

router.get('/:username/reviews', getReceivedReviewsByUsername);

router.put('/:username/profile/edit',
  idempotencyKey,
  authenticateJWT,
  uploadSingleImage,
  isAuthorizedToModifyUser,
  editUserProfile
)

router.get('/:userId', getUsernameByUserId);

export default router;