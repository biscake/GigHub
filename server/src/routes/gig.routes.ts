import { Router } from 'express';
import { createGig, deleteGig, getApplicationsByGigId, getGigs, getGigWithId, postGigApplication } from '../controllers/gig.controller';
import { authenticateJWT } from '../middleware/auth/authenticate.middleware';
import { isAuthorizedToApplyGig } from '../middleware/gig/is-authorize-apply-gig.middleware';
import { isAuthorizedToDeleteGig } from '../middleware/gig/is-authorize-delete-gig.middleware';
import { isAuthorizedToGetApplications } from '../middleware/gig/is-authorize-get-applications.middleware';
import { isValidGigId } from '../middleware/gig/is-valid-gigId.middleware';
import { idempotencyKey } from '../middleware/idempotency-key.middleware';
import { uploadSingleImage } from '../middleware/upload-assets.middleware';
import { validateRequest } from '../middleware/validate-request.middleware';
import { createGigValidators } from '../validators/gig.validator';

const router = Router();

router.post('/create',
  idempotencyKey,
  authenticateJWT,
  uploadSingleImage,
  createGigValidators,
  validateRequest,
  createGig
);

router.delete('/:id/delete', isValidGigId, authenticateJWT, isAuthorizedToDeleteGig, deleteGig);

router.get('/', getGigs);

router.get('/:id', isValidGigId, getGigWithId);

router.post('/:id/apply', idempotencyKey, isValidGigId, authenticateJWT, isAuthorizedToApplyGig, postGigApplication);

router.get('/:id/applications', isValidGigId, authenticateJWT, isAuthorizedToGetApplications, getApplicationsByGigId);

export default router