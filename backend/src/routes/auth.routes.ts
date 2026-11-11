import { Router } from 'express';
import { loginHandler, updateProfileHandler, getMe } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

/**
 * POST /api/auth/login
 * Endpoint untuk login staf/admin Helpdesk UNDIP
 */
router.post('/login', loginHandler);
router.get('/me', requireAuth, getMe);

/**
 * PUT /api/auth/profile
 * Endpoint untuk update profile
 */
router.put('/profile', requireAuth, updateProfileHandler);

export default router;