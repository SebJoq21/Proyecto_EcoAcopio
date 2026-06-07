import { Router } from 'express';
import empresaRoutes from './empresa.routes';
import categoriaRoutes from './categoria.routes';
import materialRoutes from './material.routes';
import proveedorRoutes from './proveedor.routes';
import usuarioRoutes from './usuario.routes'; 

const router = Router();

router.use('/empresas', empresaRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/materiales', materialRoutes);
router.use('/proveedores', proveedorRoutes); 
router.use('/usuarios', usuarioRoutes);

export default router;