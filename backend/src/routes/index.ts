import { Router } from 'express';
import empresaRoutes from './empresa.routes';
import categoriaRoutes from './categoria.routes'; // <-- 1. Importas la nueva ruta

const router = Router();

// Montamos las rutas
router.use('/empresas', empresaRoutes);
router.use('/categorias', categoriaRoutes); // <-- 2. La montas bajo el prefijo /categorias

export default router;