import { Router } from 'express';
import { cierreController } from '../controllers/cierre.controller';
import { verifyAuth } from '../middlewares/auth.middleware';
import { verifyTenant } from '../middlewares/tenant.middleware';

const router = Router();

// Protegemos las finanzas con los middlewares
router.use(verifyAuth);
router.use(verifyTenant);

router.get('/', cierreController.getAll);
router.post('/generar', cierreController.generar);

export default router;