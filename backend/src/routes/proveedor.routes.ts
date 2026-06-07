import { Router } from 'express';
import { proveedorController } from '../controllers/proveedor.controller';

const router = Router();

router.get('/', proveedorController.getAll);
router.get('/:id', proveedorController.getById);
router.post('/', proveedorController.create);
router.put('/:id', proveedorController.update);
router.delete('/:id', proveedorController.delete);

export default router;