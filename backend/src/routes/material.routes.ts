import { Router } from 'express';
import { materialController } from '../controllers/material.controller';

const router = Router();

router.get('/', materialController.getAll);
router.get('/:id', materialController.getById);
router.post('/', materialController.create);
router.put('/:id', materialController.update);
router.delete('/:id', materialController.delete);

export default router;