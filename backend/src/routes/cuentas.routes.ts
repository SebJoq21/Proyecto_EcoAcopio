import { Router } from 'express';
// Importamos la instancia en minúscula y con llaves
import { cuentasController } from '../controllers/cuentas.controller'; 

const router = Router();

// Ruta para registrar un abono o cargo manual
router.post('/', cuentasController.crearMovimiento.bind(cuentasController));

// Ruta para obtener el historial de movimientos de un proveedor
router.get('/:id_proveedor', cuentasController.obtenerEstadoCuenta.bind(cuentasController));

export default router;