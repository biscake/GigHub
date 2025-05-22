import { Router } from 'express';
import { createGig, deleteGig } from '../controllers/gig.controller';
import { authenticateJWT } from '../middleware/authenticate.middleware';
import { isUserAuthorizedToDeleteGig } from '../middleware/authorize-gig.middleware';
import { uploadSingleImage } from '../middleware/upload-assets.middleware';

const router = Router();

router.post('/create', authenticateJWT, uploadSingleImage, createGig);

router.delete('/delete/:id', authenticateJWT, isUserAuthorizedToDeleteGig, deleteGig);

export default router