import { Router } from 'express';
import { createGig, deleteGig, getGigs } from '../controllers/gig.controller';
import { authenticateJWT } from '../middleware/authenticate.middleware';
import { isUserAuthorizedToDeleteGig } from '../middleware/authorize-gig.middleware';
import { uploadSingleImage } from '../middleware/upload-assets.middleware';
import { validateRequest } from '../middleware/validate-request.middleware';
import { createGigValidators } from '../validators/gig.validator';

const router = Router();

router.post('/create',
  authenticateJWT,
  uploadSingleImage,
  createGigValidators,
  validateRequest,
  createGig
);

router.delete('/delete/:gigId', authenticateJWT, isUserAuthorizedToDeleteGig, deleteGig);

router.get('/', getGigs);

export default router