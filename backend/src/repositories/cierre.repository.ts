import prisma from '../config/prisma';

export class CierreRepository {
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

  async findByPeriodo(id_empresa: string, mes: number, anio: number) {
    return await prisma.cierreMensual.findFirst({
      where: {
        id_empresa,
        mes,
        anio
      }
    });
  }

  async create(data: any) {
    return await prisma.cierreMensual.create({
      data
    });
  }

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