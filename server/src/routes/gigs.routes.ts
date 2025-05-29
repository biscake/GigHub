import { Router } from 'express';
import { acceptGigApplication, createGig, deleteGig, getApplicationsByGigId, getGigs, getGigWithId, postGigApplication, rejectGigApplication } from '../controllers/gig.controller';
import { authenticateJWT } from '../middleware/auth/authenticate.middleware';
import { isOwnerOfGig } from '../middleware/gig/is-authorize-accept-gig.middleware';
import { isAuthorizedToApplyGig } from '../middleware/gig/is-authorize-apply-gig.middleware';
import { isAuthorizedToDeleteGig } from '../middleware/gig/is-authorize-delete-gig.middleware';
import { isAuthorizedToGetApplications } from '../middleware/gig/is-authorize-get-applications.middleware';
import { isValidApplicationId } from '../middleware/gig/is-valid-applicationId.middleware';
import { isValidGigId } from '../middleware/gig/is-valid-gigId.middleware';
import { idempotencyKey } from '../middleware/idempotency-key.middleware';
import { uploadSingleImage } from '../middleware/upload-assets.middleware';
import { validateRequest } from '../middleware/validate-request.middleware';
import { createGigValidators } from '../validators/gig.validator';

const router = Router();

router.get('/', getGigs);

router.post('/create',
  idempotencyKey,
  authenticateJWT,
  uploadSingleImage,
  createGigValidators,
  validateRequest,
  createGig
);

router.delete('/:gigId/delete', idempotencyKey, isValidGigId, authenticateJWT, isAuthorizedToDeleteGig, deleteGig);

router.get('/:gigId', isValidGigId, getGigWithId);

router.post('/:gigId/apply', idempotencyKey, isValidGigId, authenticateJWT, isAuthorizedToApplyGig, postGigApplication);

router.get('/:gigId/applications', isValidGigId, authenticateJWT, isAuthorizedToGetApplications, getApplicationsByGigId);

router.put('/:gigId/applications/:applicationId/accept',
  idempotencyKey,
  isValidGigId,
  isValidApplicationId,
  authenticateJWT,
  isOwnerOfGig,
  acceptGigApplication
);

router.put('/:gigId/applications/:applicationId/reject',
  idempotencyKey,
  isValidGigId,
  isValidApplicationId,
  authenticateJWT,
  isOwnerOfGig,
  rejectGigApplication
);

export default router