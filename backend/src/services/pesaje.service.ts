import { pesajeRepository } from '../repositories/pesaje.repository';
import { CreatePesajeDTO, UpdatePesajeDTO } from '../types/pesaje.dto';
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
    // Iniciamos una TRANSACCIÓN ACID: O se guarda el pesaje y el inventario juntos, o no se guarda nada.
    return await prisma.$transaction(async (tx) => {
      
      // 1. Buscamos si la empresa ya tiene un registro de inventario para este material
      const inventarioActual = await tx.inventario.findFirst({
        where: {
          id_empresa: data.id_empresa,
          id_material: data.id_material
        }
      });

      // 2. Evaluamos la regla de negocio según el tipo de movimiento
      const esCompra = data.tipo_movimiento.toUpperCase() === 'COMPRA';
      const esVenta = data.tipo_movimiento.toUpperCase() === 'VENTA';

      if (!esCompra && !esVenta) {
        throw new Error('El tipo de movimiento debe ser COMPRA o VENTA');
      }

      if (inventarioActual) {
        // REGLA: Si es venta, verificar que haya suficiente stock para no quedar en negativo
        if (esVenta && Number(inventarioActual.stock_kg) < data.peso_kg) {
          throw new Error(`Stock insuficiente. Intentas vender ${data.peso_kg}kg pero solo hay ${inventarioActual.stock_kg}kg disponibles.`);
        }

        // 3a. Actualizamos el inventario existente sumando o restando los kilos
        const variacionPeso = esCompra ? data.peso_kg : -data.peso_kg;
        
        await tx.inventario.update({
          where: { id_inventario: inventarioActual.id_inventario },
          data: {
            // Prisma tiene la función atómica 'increment' que sirve tanto para sumar como para restar (si es negativo)
            stock_kg: { increment: variacionPeso } 
          }
        });
        
      } else {
        // REGLA: No se puede vender algo que nunca se ha comprado
        if (esVenta) {
          throw new Error('No puedes registrar una VENTA de un material que no existe en tu inventario.');
        }

        // 3b. Como es la primera vez que se compra este material, creamos su fila de inventario desde cero
        await tx.inventario.create({
          data: {
            id_empresa: data.id_empresa,
            id_material: data.id_material,
            stock_kg: data.peso_kg
            // stock_minimo_kg tomará su valor por defecto de 0.00 según tu schema
          }
        });
      }

      // 4. Finalmente, ya con el inventario cuadrado, creamos el ticket de pesaje
      const nuevoPesaje = await tx.pesaje.create({
        data
      });

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