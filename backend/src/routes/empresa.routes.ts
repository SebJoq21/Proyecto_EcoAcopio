import { Router } from 'express';
import { empresaController } from '../controllers/empresa.controller';
import { verifyAuth } from '../middlewares/auth.middleware';
import { verifyTenant } from '../middlewares/tenant.middleware';

const router = Router();

// 🟢 PÚBLICA: Registro de nueva empresa desde la Landing Page
router.post('/', empresaController.create);

// 🔴 PROTEGIDAS: Requieren token de sesión y pertenecer a un Tenant
router.get('/', verifyAuth, verifyTenant, empresaController.getAll);
router.get('/:id', verifyAuth, verifyTenant, empresaController.getById);
router.put('/:id', verifyAuth, verifyTenant, empresaController.update);
router.delete('/:id', verifyAuth, verifyTenant, empresaController.delete);

export default router;
