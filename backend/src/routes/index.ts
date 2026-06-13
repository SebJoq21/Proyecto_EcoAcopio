import { Router } from 'express';
import empresaRoutes from './empresa.routes';
import categoriaRoutes from './categoria.routes';
import materialRoutes from './material.routes';
import proveedorRoutes from './proveedor.routes';
import usuarioRoutes from './usuario.routes'; 
import pesajeRoutes from './pesaje.routes';
import inventarioRoutes from './inventario.routes';
import cierreRoutes from './cierre.routes';
import authRoutes from './auth.routes';
import { verifyAuth } from '../middlewares/auth.middleware';
import { verifyTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.use('/empresas', empresaRoutes);
router.use('/categorias', verifyAuth, verifyTenant, categoriaRoutes);
router.use('/materiales', verifyAuth, verifyTenant, materialRoutes);
router.use('/proveedores', verifyAuth, verifyTenant, proveedorRoutes); 
router.use('/usuarios', usuarioRoutes);
router.use('/pesajes', verifyAuth, verifyTenant, pesajeRoutes);
router.use('/inventario', verifyAuth, verifyTenant, inventarioRoutes);
router.use('/cierres', verifyAuth, verifyTenant, cierreRoutes);
router.use('/auth', authRoutes);

export default router;