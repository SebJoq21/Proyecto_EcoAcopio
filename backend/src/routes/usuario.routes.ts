import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller';
import { verifyAuth } from '../middlewares/auth.middleware';
import { verifyTenant } from '../middlewares/tenant.middleware';

const router = Router();

// 🔴 PROTEGIDAS: Solo un administrador logueado puede gestionar operarios
router.get('/', verifyAuth, verifyTenant, usuarioController.getAll);
router.get('/:id', verifyAuth, verifyTenant, usuarioController.getById);
router.post('/', verifyAuth, verifyTenant, usuarioController.create);
router.put('/:id', verifyAuth, verifyTenant, usuarioController.update);
router.delete('/:id', verifyAuth, verifyTenant, usuarioController.delete);

export default router;