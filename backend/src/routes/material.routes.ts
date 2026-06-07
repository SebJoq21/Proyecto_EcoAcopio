import { Router } from 'express';
import { materialController } from '../controllers/material.controller';
import { verifyAuth } from '../middlewares/auth.middleware';
import { verifyTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.use(verifyAuth);
router.use(verifyTenant);

router.get('/', materialController.getAll);
router.get('/:id', materialController.getById);
router.post('/', materialController.create);
router.put('/:id', materialController.update);
router.delete('/:id', materialController.delete);

export default router;