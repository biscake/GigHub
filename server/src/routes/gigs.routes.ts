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
import { isOngoingApplications } from '../middleware/gig/is-ongoing-applications.middleware';

const router = Router();

router.get('/', getGigs);

router.get('/posted', authenticateJWT, getUserPostedGigs);

router.post('/create',
  idempotencyKey,              // Ensure HTTP requests are only processed once
  authenticateJWT,             // Verify, decode JWT and attach user info to req.user
  uploadSingleImage,           // Handles file upload from client making it available in req.file
  createGigValidators,         // Validations for request body of create gig form
  validateRequest,             // Throws validation error if any and stops request
  createGig                    // Controller to handle the create gig request
);

router.delete('/:gigId/',
  idempotencyKey,           
  authenticateJWT,          
  isValidGigId,
  isOngoingApplications,       // Gets GigId from params and check for valid gig in database, throws any error found
  isAuthorizedToDeleteGig,     // Checks if user is authorised to delete the gig
  deleteGig                    // Controller to handle the delete gig request
);

router.get('/:gigId', 
  isValidGigId,             
  getGigWithId                 // Controller to handle get gig request
);

router.post('/:gigId/apply',
  idempotencyKey, 
  isValidGigId, 
  authenticateJWT, 
  isAuthorizedToApplyGig,      // Checks if user is authorised to apply for the gig
  postGigApplication           // Controller to handle apply gig request
);

router.get('/applications/sent', 
  authenticateJWT, 
  getUserSentApplications      // Controller to handle get applications request
);

router.get('/applications/received', 
  authenticateJWT, 
  getUserReceivedApplications  // Controller to handle request to get applications for a gig
);

router.get('/applications/accepted', 
  authenticateJWT, 
  getUserAcceptedGigs
);

router.get('/applications/stats', 
  authenticateJWT, 
  getUserApplicationStats     // Controller to handle request to get application stats
);

router.delete('/applications/:applicationId', 
  idempotencyKey, 
  authenticateJWT, 
  isValidApplicationId,             // Gets applicationId from params and check for valid application in database, throws any error found
  isAuthorizedToModifyApplication,  // Checks if user is authorised to delete/edit the gig application
  deleteApplication                 // Controller to handle delete application request
);

router.put('/applications/:applicationId/edit', 
  idempotencyKey, 
  authenticateJWT, 
  isValidApplicationId, 
  isAuthorizedToModifyApplication, 
  editApplication                   // Controller to handle edit application request
);

router.put('/:gigId/applications/:applicationId/accept',
  idempotencyKey,
  isValidGigId,
  isValidApplicationId,
  authenticateJWT,
  isOwnerOfGig,               // Checks if user is owner of the gig posted
  acceptGigApplication        // Controller to handle accept application request
);

router.put('/:gigId/applications/:applicationId/reject',
  idempotencyKey,
  isValidGigId,
  isValidApplicationId,
  authenticateJWT,
  isOwnerOfGig,
  rejectGigApplication        // Controller to handle reject application request
);

export default router