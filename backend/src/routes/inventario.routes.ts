import { Router } from 'express';
import { inventarioController } from '../controllers/inventario.controller';
import { verifyAuth } from '../middlewares/auth.middleware';
import { verifyTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.use(verifyAuth);
router.use(verifyTenant);

router.get('/', inventarioController.getAll);
router.put('/:id/stock-minimo', inventarioController.updateMinimo);

export default router;