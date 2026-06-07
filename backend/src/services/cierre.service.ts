import { cierreRepository } from '../repositories/cierre.repository';
import { CreateCierreDTO } from '../types/cierre.dto';
import prisma from '../config/prisma';

export class CierreService {
  async getCierresByEmpresa(id_empresa: string) {
    return await cierreRepository.findAllByEmpresa(id_empresa);
  }

  async generarCierreMensual(data: CreateCierreDTO) {
    // 1. Validar que no se cierre el mismo mes dos veces
    const cierreExistente = await cierreRepository.findByPeriodo(data.id_empresa, data.mes, data.anio);
    if (cierreExistente) {
      throw new Error(`El cierre contable para el mes ${data.mes} del año ${data.anio} ya fue generado previamente.`);
    }

    // 2. Calcular las fechas de inicio y fin del mes solicitado
    const fechaInicio = new Date(data.anio, data.mes - 1, 1);
    const fechaFin = new Date(data.anio, data.mes, 1);

    // 3. Iniciar una transacción para asegurar el cálculo
    return await prisma.$transaction(async (tx) => {
      // Obtener todos los pesajes COMPLETADOS de ese mes exacto
      const pesajesDelMes = await tx.pesaje.findMany({
        where: {
          id_empresa: data.id_empresa,
          estado: 'Completado',
          fecha_creacion: {
            gte: fechaInicio,
            lt: fechaFin
          }
        }
      });

      // 4. Variables acumuladoras para el balance
      let total_kilos_comprados = 0;
      let total_kilos_vendidos = 0;
      let inversion_total = 0;
      let ingreso_total = 0;

      // 5. Calcular los totales
      pesajesDelMes.forEach(pesaje => {
        const kilos = Number(pesaje.peso_kg);
        const dinero = Number(pesaje.total_pagado);

        if (pesaje.tipo_movimiento.toUpperCase() === 'COMPRA') {
          total_kilos_comprados += kilos;
          inversion_total += dinero;
        } else if (pesaje.tipo_movimiento.toUpperCase() === 'VENTA') {
          total_kilos_vendidos += kilos;
          ingreso_total += dinero;
        }
      });

      // 6. Guardar el Cierre Mensual con los montos calculados
      const nuevoCierre = await tx.cierreMensual.create({
        data: {
          id_empresa: data.id_empresa,
          id_usuario: data.id_usuario,
          mes: data.mes,
          anio: data.anio,
          total_kilos_comprados,
          total_kilos_vendidos,
          inversion_total,
          ingreso_total
        }
      });

      // 7. (Opcional pero recomendado) Amarrar los pesajes a este ID de cierre 
      // para que quede evidencia de qué tickets formaron este balance.
      await tx.pesaje.updateMany({
        where: {
          id_pesaje: { in: pesajesDelMes.map(p => p.id_pesaje) }
        },
        data: { id_cierre: nuevoCierre.id_cierre }
      });

      return nuevoCierre;
    });
  }
}

export const cierreService = new CierreService();