import { Router } from 'express';
import empresaRoutes from './empresa.routes';
import categoriaRoutes from './categoria.routes';
import materialRoutes from './material.routes';
import proveedorRoutes from './proveedor.routes'; 

const router = Router();

router.use('/empresas', empresaRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/materiales', materialRoutes);
router.use('/proveedores', proveedorRoutes); 

export default router;