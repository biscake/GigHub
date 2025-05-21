import { Router } from 'express';
import { createGig } from '../controllers/gig.controller';
import { uploadSingleImage } from '../middleware/upload-assets.middleware';

const router = Router();

router.post('/upload', uploadSingleImage, createGig);

export default router