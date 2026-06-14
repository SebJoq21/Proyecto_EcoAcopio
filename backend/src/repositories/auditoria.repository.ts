import prisma from '../config/prisma';
import { CreateAuditoriaDTO } from '../types/auditoria.dto';

export class AuditoriaRepository {
  async create(data: CreateAuditoriaDTO) {
    return await prisma.auditoria.create({
      data: {
        id_empresa: data.id_empresa,
        id_usuario: data.id_usuario,
        entidad: data.entidad,
        accion: data.accion,
        id_registro_afectado: data.id_registro_afectado,
        valores_anteriores: data.valores_anteriores ? data.valores_anteriores : undefined,
        valores_nuevos: data.valores_nuevos ? data.valores_nuevos : undefined,
      }
    });
  }

  async findAllByEmpresa(id_empresa: string) {
    return await prisma.auditoria.findMany({
      where: { id_empresa },
      include: {
        usuario: { select: { nombres: true, apellidos: true } }
      },
      orderBy: { fecha_creacion: 'desc' }
    });
  }
}

export const auditoriaRepository = new AuditoriaRepository();