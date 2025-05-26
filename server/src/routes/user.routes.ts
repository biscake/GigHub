import { Router } from 'express';
import { getProfileByUsername, getReceivedReviewsByUsername } from '../controllers/user.controller';

const router = Router();

router.get('/:username/profile', getProfileByUsername);

router.get('/:username/reviews', getReceivedReviewsByUsername);

export default router;