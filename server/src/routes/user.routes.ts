import { Router } from 'express';
import { getProfileByUsername } from '../controllers/user.controller';

const router = Router();

router.get('/:username/profile', getProfileByUsername);

export default router;