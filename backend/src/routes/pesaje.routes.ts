import { Router } from 'express';
import { pesajeController } from '../controllers/pesaje.controller';
import { verifyAuth } from '../middlewares/auth.middleware';
import { verifyTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.use(verifyAuth);
router.use(verifyTenant);

// Rutas protegidas
router.get('/', pesajeController.getAll);
router.get('/:id', pesajeController.getById);
router.post('/', pesajeController.create);
router.put('/:id', pesajeController.update);
router.delete('/:id', pesajeController.anular); // Usamos DELETE como verbo HTTP, pero nuestro código solo anula

export default router;