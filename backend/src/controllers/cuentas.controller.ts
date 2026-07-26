import { Request, Response } from 'express';
import { cuentasService } from '../services/cuentas.service';
import { CreateMovimientoDTO } from '../types/cuentas.dto';

export class CuentasController {
  
  async crearMovimiento(req: Request, res: Response): Promise<void> {
    try {
      // Nota: id_empresa e id_usuario idealmente deberían venir de tu middleware de autenticación (ej. req.user)
      const data: CreateMovimientoDTO = req.body;

      const nuevoMovimiento = await cuentasService.registrarMovimiento(data);

      res.status(201).json({
        success: true,
        message: 'Movimiento financiero registrado correctamente',
        data: nuevoMovimiento
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al registrar el movimiento'
      });
    }
  }

  async obtenerEstadoCuenta(req: Request, res: Response): Promise<void> {
  try {
    // Le decimos explícitamente a TypeScript que esto es un string
    const id_proveedor = req.params.id_proveedor as string; 
    
    // Hacemos lo mismo con el id_empresa por si acaso
    const id_empresa = (req.query.id_empresa as string) || req.body.id_empresa;

    const movimientos = await cuentasService.listarEstadoCuenta(id_proveedor, id_empresa);

    res.status(200).json({
      success: true,
      data: movimientos
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error al obtener el estado de cuenta'
    });
  }
}
}

export const cuentasController = new CuentasController();