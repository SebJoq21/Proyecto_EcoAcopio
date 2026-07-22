import { cuentasRepository } from '../repositories/cuentas.repository';
import { CreateMovimientoDTO } from '../types/cuentas.dto';
import { TipoMovimientoFinanciero } from '@prisma/client';
import prisma from '../config/prisma';

export class CuentasService {
  
  async registrarMovimiento(data: CreateMovimientoDTO) {
    // 1. Validar campos obligatorios
    if (!data.id_empresa || !data.id_proveedor || !data.id_usuario || !data.monto || !data.concepto) {
      throw new Error('Faltan campos obligatorios para registrar el movimiento financiero.');
    }

    // 2. Validar que el monto sea un valor lógico
    if (data.monto <= 0) {
      throw new Error('El monto del movimiento debe ser mayor a cero.');
    }

    // 3. Validar que el tipo de movimiento sea correcto
    if (!Object.values(TipoMovimientoFinanciero).includes(data.tipo_movimiento)) {
      throw new Error('El tipo de movimiento es inválido. Debe ser CARGO o ABONO.');
    }

    // 4. Validar que el proveedor exista y pertenezca a la empresa actual (Seguridad)
    const proveedor = await prisma.proveedor.findFirst({
      where: {
        id_provider: data.id_proveedor,
        id_empresa: data.id_empresa,
      },
      select: { id_provider: true } // Solo pedimos el ID para que la consulta sea ultra rápida
    });

    if (!proveedor) {
      throw new Error('El proveedor no existe o no pertenece a este centro de acopio.');
    }

    // Si pasa todas las validaciones, procedemos con la transacción
    return await cuentasRepository.crearMovimientoConTransaccion(data);
  }

  async listarEstadoCuenta(id_proveedor: string, id_empresa: string) {
    if (!id_proveedor || !id_empresa) {
      throw new Error('Faltan parámetros requeridos (Proveedor o Empresa).');
    }

    // Validar que el proveedor exista antes de buscar su historial
    const proveedor = await prisma.proveedor.findFirst({
      where: { 
        id_provider: id_proveedor, 
        id_empresa: id_empresa 
      },
      select: { id_provider: true }
    });

    if (!proveedor) {
      throw new Error('El proveedor no existe o no tiene permisos para ver este estado de cuenta.');
    }

    return await cuentasRepository.obtenerMovimientosPorProveedor(id_proveedor, id_empresa);
  }
}

// Exportamos la instancia directamente para mantener tu estándar de arquitectura
export const cuentasService = new CuentasService();