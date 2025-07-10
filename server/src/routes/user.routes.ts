import { Router } from 'express';
import { searchUser, createReview, editUserProfile, getProfileByUsername, getReceivedReviewsByUsername, getUserIdByUsername, getUsernameByUserId } from '../controllers/user.controller';
import { idempotencyKey } from '../middleware/idempotency-key.middleware';
import { authenticateJWT } from '../middleware/auth/authenticate.middleware';
import { isAuthorizedToModifyUser } from '../middleware/user/is-authorize-modify-user';
import { uploadSingleImage } from '../middleware/upload-assets.middleware';
import { createReviewValidators } from '../validators/user.validator';
import { validateRequest } from '../middleware/validate-request.middleware';
import { isAuthorizedToReview } from '../middleware/user/is-authorize-review';

const router = Router();

router.get('/', 
  searchUser
);

router.get('/:username/profile', 
  getProfileByUsername              // Controller to handle get profile requests
);

router.get('/:username/reviews', 
  getReceivedReviewsByUsername      // Controller to handle get reviews requests
);

router.post('/:username/review',
  idempotencyKey,                   // Ensure HTTP requests are only processed once
  authenticateJWT,                  // Verify, decode JWT and attach user info to req.user
  isAuthorizedToReview,             // Checks if reviewer is authorised to review the reviewee
  createReviewValidators,           // Validations for request body of create review form
  validateRequest,                  // Throws validation error if any and stops request
  createReview                      // Controller to handle the create gig request
);

router.put('/:username/profile/edit',
  idempotencyKey,
  authenticateJWT,
  uploadSingleImage,                // Handles file upload from client making it available in req.file
  isAuthorizedToModifyUser,         // Checks if user is authorised to edit the user profile
  editUserProfile                   // Controller to handle the edit user profile request
);


router.get('/:username', 
  getUserIdByUsername               // Controller to get UserId from Username
);

router.get('/userid/:id', 
  getUsernameByUserId               // Controller to get Username from UserId
);

export default router;