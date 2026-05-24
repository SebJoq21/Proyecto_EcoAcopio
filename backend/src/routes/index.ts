import { Router } from 'express';
import empresaRoutes from './empresa.routes';

const router = Router();

router.use('/empresas', empresaRoutes);

export default router;