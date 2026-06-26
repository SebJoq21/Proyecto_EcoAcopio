import prisma from '../config/prisma';

export class CierreRepository {
  // 1. Historial de todos los cierres mensuales de la empresa
  async findAllByEmpresa(id_empresa: string) {
    return await prisma.cierreMensual.findMany({
      where: { id_empresa },
      include: {
        usuario: { select: { nombres: true, apellidos: true } }
      },
      orderBy: [
        { anio: 'desc' },
        { mes: 'desc' }
      ]
    });
  }

  // 2. Buscar si ya existe un cierre para un mes y año específico
  async findByPeriodo(id_empresa: string, mes: number, anio: number) {
    return await prisma.cierreMensual.findFirst({
      where: {
        id_empresa,
        mes,
        anio
      }
    });
  }

  // 3. Crear el registro del cierre (Guardar la "foto" financiera del mes)
  async create(data: any) {
    return await prisma.cierreMensual.create({
      data
    });
  }

  // 4. Obtener todos los pesajes completados en un rango de fechas
  async findPesajesByPeriodo(id_empresa: string, fechaInicio: Date, fechaFin: Date) {
    return await prisma.pesaje.findMany({
      where: {
        id_empresa,
        estado: 'Completado',
        fecha_creacion: {
          gte: fechaInicio,
          lt: fechaFin
        }
      },
      include: {
        material: { select: { nombre: true, emoji: true, categoria: { select: { nombre: true } } } },
        proveedor: { select: { nombre_completo: true } }
      },
      orderBy: { fecha_creacion: 'asc' }
    });
  }
}

export const cierreRepository = new CierreRepository();