import { Router } from 'express';
import { createGig } from '../controllers/gig.controller';
import { authenticateJWT } from '../middleware/authenticate.middleware';
import { uploadSingleImage } from '../middleware/upload-assets.middleware';

const router = Router();

router.post('/create', authenticateJWT, uploadSingleImage, createGig);

export default router