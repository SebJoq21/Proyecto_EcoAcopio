import { Router } from 'express';
import { auditoriaController } from '../controllers/auditoria.controller';
import { verifyAuth } from '../middlewares/auth.middleware';
import { verifyTenant } from '../middlewares/tenant.middleware';

const router = Router();

// Protegemos la ruta para asegurar que solo usuarios autenticados y de la misma empresa entren
router.use(verifyAuth);
router.use(verifyTenant);

// GET /api/v1/auditorias
router.get('/', auditoriaController.getAll);

export default router;