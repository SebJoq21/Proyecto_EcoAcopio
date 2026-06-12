import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { verifyAuth } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', authController.login);

// GET /api/v1/auth/me
router.get('/me', verifyAuth, authController.getMe);

export default router;