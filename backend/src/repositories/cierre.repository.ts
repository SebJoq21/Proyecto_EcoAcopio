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
}

export const cierreRepository = new CierreRepository();