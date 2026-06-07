import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller';

const router = Router();

// Rutas base para /api/v1/usuarios
router.get('/', usuarioController.getAll);
router.get('/:id', usuarioController.getById);
router.post('/', usuarioController.create);
router.put('/:id', usuarioController.update);
router.delete('/:id', usuarioController.delete);

export default router;