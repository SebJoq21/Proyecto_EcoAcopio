import { Router } from 'express';
import { empresaController } from '../controllers/empresa.controller';

const router = Router();

// Mapeamos los métodos HTTP a las funciones del controlador
router.get('/', empresaController.getAll);
router.get('/:id', empresaController.getById);
router.post('/', empresaController.create);
router.put('/:id', empresaController.update);
router.delete('/:id', empresaController.delete);

export default router;