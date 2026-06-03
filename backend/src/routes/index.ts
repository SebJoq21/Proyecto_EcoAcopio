import { Router } from 'express';
import empresaRoutes from './empresa.routes';
import categoriaRoutes from './categoria.routes';
import materialRoutes from './material.routes'; 

const router = Router();

router.use('/empresas', empresaRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/materiales', materialRoutes); 

export default router;