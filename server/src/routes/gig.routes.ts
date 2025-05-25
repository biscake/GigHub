import { Router } from 'express';
import { createGig, deleteGig, getGigs, getGigWithId, postGigApplication } from '../controllers/gig.controller';
import { authenticateJWT } from '../middleware/auth/authenticate.middleware';
import { isUserAuthorizedToDeleteGig } from '../middleware/gig/is-user-authorize-delete-gig.middleware';
import { idempotencyKey } from '../middleware/idempotency-key.middleware';
import { uploadSingleImage } from '../middleware/upload-assets.middleware';
import { validateRequest } from '../middleware/validate-request.middleware';
import { createGigValidators } from '../validators/gig.validator';
import { isUserAuthorizedToApplyGig } from '../middleware/gig/is-valid-gigId.middleware';

const router = Router();

router.post('/create',
  idempotencyKey,
  authenticateJWT,
  uploadSingleImage,
  createGigValidators,
  validateRequest,
  createGig
);

router.delete('/delete/:gigId', authenticateJWT, isUserAuthorizedToDeleteGig, deleteGig);

router.get('/', getGigs);

router.get('/:id', getGigWithId);

router.post('/:id/apply', idempotencyKey, authenticateJWT, isUserAuthorizedToApplyGig, postGigApplication);

export default router