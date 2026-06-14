import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { verifyAuth } from '../middlewares/auth.middleware';

const router = Router();

// 🟢 PÚBLICA: Cualquier usuario puede intentar iniciar sesión
router.post('/login', authController.login);

// 🔴 PROTEGIDA: Solo usuarios logueados pueden pedir sus datos
router.get('/me', verifyAuth, authController.getMe);

export default router;