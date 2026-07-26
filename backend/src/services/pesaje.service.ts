import { pesajeRepository } from '../repositories/pesaje.repository';
import { CreatePesajeDTO, UpdatePesajeDTO } from '../types/pesaje.dto';
import { TipoMovimientoFinanciero } from '@prisma/client';
import prisma from '../config/prisma';

export class PesajeService {
  async getPesajesByEmpresa(id_empresa: string) {
    return await pesajeRepository.findAllByEmpresa(id_empresa);
  }

  async getPesajeById(id: string) {
    const pesaje = await pesajeRepository.findById(id);
    if (!pesaje) throw new Error('Ticket de pesaje no encontrado');
    return pesaje;
  }

  async createPesaje(data: CreatePesajeDTO) {
    const valor_total = Number((data.peso_kg * data.precio_unitario).toFixed(2));

    return await prisma.$transaction(async (tx) => {
      
      const inventarioActual = await tx.inventario.findFirst({
        where: {
          id_empresa: data.id_empresa,
          id_material: data.id_material
        }
      });

      const esCompra = data.tipo_movimiento.toUpperCase() === 'COMPRA' || data.tipo_movimiento.toUpperCase() === 'ENTRADA';
      const esVenta = data.tipo_movimiento.toUpperCase() === 'VENTA' || data.tipo_movimiento.toUpperCase() === 'SALIDA';

      if (!esCompra && !esVenta) {
        throw new Error('El tipo de movimiento debe ser COMPRA/ENTRADA o VENTA/SALIDA');
      }

      if (inventarioActual) {
        if (esVenta && Number(inventarioActual.stock_kg) < data.peso_kg) {
          throw new Error(`Stock insuficiente. Intentas vender ${data.peso_kg}kg pero solo hay ${inventarioActual.stock_kg}kg disponibles.`);
        }

        const variacionPeso = esCompra ? data.peso_kg : -data.peso_kg;
        
        await tx.inventario.update({
          where: { id_inventario: inventarioActual.id_inventario },
          data: {
            stock_kg: { increment: variacionPeso } 
          }
        });
        
      } else {
        if (esVenta) {
          throw new Error('No puedes registrar una VENTA de un material que no existe en tu inventario.');
        }

        await tx.inventario.create({
          data: {
            id_empresa: data.id_empresa,
            id_material: data.id_material,
            stock_kg: data.peso_kg
          }
        });
      }

      const nuevoPesaje = await tx.pesaje.create({
        data: { ...data, valor_total }
      });

      if (esCompra && data.id_proveedor) {
        await tx.cuentaCorriente.create({
          data: {
            id_empresa: data.id_empresa,
            id_proveedor: data.id_proveedor,
            id_usuario: data.id_usuario,
            id_pesaje: nuevoPesaje.id_pesaje,
            tipo_movimiento: TipoMovimientoFinanciero.CARGO,
            monto: valor_total,
            concepto: 'Ingreso de material',
          },
        });

        await tx.proveedor.update({
          where: { id_provider: data.id_proveedor },
          data: { saldo_actual: { increment: valor_total } },
        });

        const totalPagado = Number(data.total_pagado || 0);
        if (totalPagado > 0) {
          await tx.cuentaCorriente.create({
            data: {
              id_empresa: data.id_empresa,
              id_proveedor: data.id_proveedor,
              id_usuario: data.id_usuario,
              id_pesaje: nuevoPesaje.id_pesaje,
              tipo_movimiento: TipoMovimientoFinanciero.ABONO,
              monto: totalPagado,
              concepto: 'Pago en efectivo por pesaje',
            },
          });

          await tx.proveedor.update({
            where: { id_provider: data.id_proveedor },
            data: { saldo_actual: { decrement: totalPagado } },
          });
        }
      }

      return nuevoPesaje;
    });
  }

  async updatePesaje(id: string, data: UpdatePesajeDTO) {
    await this.getPesajeById(id);
    return await pesajeRepository.update(id, data);
  }

  async anularPesaje(id: string) {
    // 1. Obtener el pesaje actual para saber exactamente qué revertir
    const pesajeActual = await this.getPesajeById(id);

    // 2. Validar que no esté ya anulado para evitar doble reversión matemática
    if (pesajeActual.estado.toUpperCase() === 'ANULADO') {
      throw new Error('Este ticket de pesaje ya se encuentra anulado.');
    }

    // 3. Iniciamos la Transacción ACID para la reversión
    return await prisma.$transaction(async (tx) => {
      // Buscar el inventario afectado
      const inventario = await tx.inventario.findFirst({
        where: {
          id_empresa: pesajeActual.id_empresa,
          id_material: pesajeActual.id_material
        }
      });

      if (!inventario) {
        throw new Error('No se encontró el inventario asociado a este material para revertir la operación.');
      }

      // 4. Determinar la operación matemática INVERSA
      const esCompra = pesajeActual.tipo_movimiento.toUpperCase() === 'COMPRA';
      
      // Si fue compra (+), la inversa es restar (-). Si fue venta (-), la inversa es sumar (+)
      const kilosPesaje = Number(pesajeActual.peso_kg);
      const variacionInversa = esCompra ? -kilosPesaje : kilosPesaje;

      // REGLA DE SEGURIDAD: Evitar que anular una compra deje el almacén en negativo
      if (esCompra && Number(inventario.stock_kg) < kilosPesaje) {
        throw new Error(`No puedes anular esta COMPRA. Intentas restar ${kilosPesaje}kg, pero tu stock actual es de solo ${inventario.stock_kg}kg. (Quizás ya vendiste este material).`);
      }

      // 5. Actualizar el inventario (Aplicar la reversión)
      await tx.inventario.update({
        where: { id_inventario: inventario.id_inventario },
        data: {
          stock_kg: { increment: variacionInversa }
        }
      });

      // 6. Finalmente, actualizar el estado del ticket original
      const pesajeAnulado = await tx.pesaje.update({
        where: { id_pesaje: id },
        data: { estado: 'Anulado' }
      });

      return pesajeAnulado;
    });
  }
}

export const pesajeService = new PesajeService();