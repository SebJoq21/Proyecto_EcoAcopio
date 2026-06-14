import { cierreRepository } from '../repositories/cierre.repository';
import { CreateCierreDTO } from '../types/cierre.dto';
import prisma from '../config/prisma';

export class CierreService {
  async getCierresByEmpresa(id_empresa: string) {
    return await cierreRepository.findAllByEmpresa(id_empresa);
  }

  async obtenerReporteDinamico(id_empresa: string, mes: number, anio: number) {
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 1);

    const pesajes = await cierreRepository.findPesajesByPeriodo(id_empresa, fechaInicio, fechaFin);

    let total_entradas = 0;
    let total_salidas = 0;

    for (const p of pesajes) {
      const kg = Number(p.peso_kg);
      const tipo = p.tipo_movimiento.toUpperCase();
      if (tipo === 'COMPRA' || tipo === 'ENTRADA') {
        total_entradas += kg;
      } else if (tipo === 'VENTA' || tipo === 'SALIDA') {
        total_salidas += kg;
      }
    }

    const transacciones = pesajes.length;
    const balance_neto = total_entradas - total_salidas;

    return {
      total_entradas,
      total_salidas,
      transacciones,
      balance_neto,
      detalles: pesajes
    };
  }

  async generarCierreMensual(data: CreateCierreDTO) {
    const cierreExistente = await cierreRepository.findByPeriodo(data.id_empresa, data.mes, data.anio);
    if (cierreExistente) {
      throw new Error(`El cierre contable para el mes ${data.mes} del año ${data.anio} ya fue generado previamente.`);
    }

    const fechaInicio = new Date(data.anio, data.mes - 1, 1);
    const fechaFin = new Date(data.anio, data.mes, 1);

    return await prisma.$transaction(async (tx) => {
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

      let total_kilos_comprados = 0;
      let total_kilos_vendidos = 0;
      let inversion_total = 0;
      let ingreso_total = 0;

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

      await tx.pesaje.updateMany({
        where: {
          id_pesaje: { in: pesajesDelMes.map(p => p.id_pesaje) }
        },
        data: { id_cierre: nuevoCierre.id_cierre }
      });

      return nuevoCierre;
    });
  }

  async exportarCSV(id_empresa: string, mes: number, anio: number): Promise<string> {
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 1);
    const pesajes = await cierreRepository.findPesajesByPeriodo(id_empresa, fechaInicio, fechaFin);

    const cabeceras = 'Fecha,Material,Proveedor,Peso (kg),Tipo\n';
    const filas = pesajes.map(p => {
      const fecha = p.fecha_creacion instanceof Date
        ? p.fecha_creacion.toLocaleDateString('es-PE')
        : new Date(p.fecha_creacion).toLocaleDateString('es-PE');
      const material = p.material?.nombre?.replace(/,/g, ' ') || '';
      const proveedor = p.proveedor?.nombre_completo?.replace(/,/g, ' ') || '';
      const peso = Number(p.peso_kg).toFixed(2);
      const tipo = (p.tipo_movimiento || '').toUpperCase();
      const etiqueta = (tipo === 'COMPRA' || tipo === 'ENTRADA') ? 'Entrada' : 'Salida';
      return `${fecha},${material},${proveedor},${peso},${etiqueta}`;
    }).join('\n');

    return cabeceras + filas;
  }
}

export const cierreService = new CierreService();
