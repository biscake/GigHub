import { Router } from 'express';
import { acceptGigApplication, createGig, deleteApplication, deleteGig, editApplication, getGigs, getGigWithId, getUserAcceptedGigs, getUserApplicationStats, getUserPostedGigs, getUserReceivedApplications, getUserSentApplications, postGigApplication, rejectGigApplication } from '../controllers/gig.controller';
import { authenticateJWT } from '../middleware/auth/authenticate.middleware';
import { isOwnerOfGig } from '../middleware/gig/is-authorize-accept-gig.middleware';
import { isAuthorizedToApplyGig } from '../middleware/gig/is-authorize-apply-gig.middleware';
import { isAuthorizedToDeleteGig } from '../middleware/gig/is-authorize-delete-gig.middleware';
import { isValidApplicationId } from '../middleware/gig/is-valid-applicationId.middleware';
import { isValidGigId } from '../middleware/gig/is-valid-gigId.middleware';
import { idempotencyKey } from '../middleware/idempotency-key.middleware';
import { uploadSingleImage } from '../middleware/upload-assets.middleware';
import { validateRequest } from '../middleware/validate-request.middleware';
import { createGigValidators } from '../validators/gig.validator';
import { isAuthorizedToModifyApplication } from '../middleware/gig/is-authorize-modify-application.middleware';

const router = Router();

router.get('/', getGigs);

router.get('/posted', authenticateJWT, getUserPostedGigs);

router.post('/create',
  idempotencyKey,
  authenticateJWT,
  uploadSingleImage,
  createGigValidators,
  validateRequest,
  createGig
);

router.delete('/:gigId/', idempotencyKey, authenticateJWT, isValidGigId, isAuthorizedToDeleteGig, deleteGig);

router.get('/:gigId', isValidGigId, getGigWithId);

router.post('/:gigId/apply', idempotencyKey, isValidGigId, authenticateJWT, isAuthorizedToApplyGig, postGigApplication);

router.get('/applications/sent', authenticateJWT, getUserSentApplications);

router.get('/applications/received', authenticateJWT, getUserReceivedApplications);

router.get('/applications/accepted', authenticateJWT, getUserAcceptedGigs);

router.get('/applications/stats', authenticateJWT, getUserApplicationStats);

router.delete('/applications/:applicationId', idempotencyKey, authenticateJWT, isValidApplicationId, isAuthorizedToModifyApplication, deleteApplication);

router.put('/applications/:applicationId/edit', idempotencyKey, authenticateJWT, isValidApplicationId, isAuthorizedToModifyApplication, editApplication);

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