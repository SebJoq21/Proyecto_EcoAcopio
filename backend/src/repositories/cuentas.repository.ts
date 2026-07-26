import prisma from '../config/prisma';
import { TipoMovimientoFinanciero } from '@prisma/client';
import { CreateMovimientoDTO } from '../types/cuentas.dto';

export class CuentasRepository {
  
  async crearMovimientoConTransaccion(data: CreateMovimientoDTO) {
    return await prisma.$transaction(async (tx) => {
      // 1. Crear el registro en el libro mayor (Cuenta Corriente)
      const movimiento = await tx.cuentaCorriente.create({
        data: {
          id_empresa: data.id_empresa,
          id_proveedor: data.id_proveedor,
          id_usuario: data.id_usuario,
          id_pesaje: data.id_pesaje || null,
          tipo_movimiento: data.tipo_movimiento,
          monto: data.monto,
          concepto: data.concepto,
        },
      });

      // 2. Actualizar el saldo del proveedor de forma atómica
      // CARGO sube la deuda, ABONO baja la deuda
      const actualizacionSaldo = data.tipo_movimiento === TipoMovimientoFinanciero.CARGO
        ? { increment: data.monto }
        : { decrement: data.monto };

      await tx.proveedor.update({
        where: { id_provider: data.id_proveedor },
        data: { saldo_actual: actualizacionSaldo },
      });

      return movimiento;
    });
  }

  async obtenerMovimientosPorProveedor(id_proveedor: string, id_empresa: string) {
    return await prisma.cuentaCorriente.findMany({
      where: {
        id_proveedor: id_proveedor,
        id_empresa: id_empresa,
      },
      orderBy: {
        fecha_creacion: 'desc', // Los más recientes primero
      },
      include: {
        usuario: { select: { nombres: true, apellidos: true } }, // Para saber quién hizo el movimiento
      }
    });
  }
}

export const cuentasRepository = new CuentasRepository();