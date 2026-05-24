import prisma from '../config/prisma';
import { CreateEmpresaDTO, UpdateEmpresaDTO } from '../types/empresa.dto';

export class EmpresaRepository {
  // 1. Obtener todas las empresas activas
  async findAll() {
    return await prisma.empresa.findMany({
      orderBy: { fecha_creacion: 'desc' }
    });
  }

  // 2. Buscar una empresa por su ID
  async findById(id: string) {
    return await prisma.empresa.findUnique({
      where: { id_empresa: id }
    });
  }

  // 3. Crear una nueva empresa
  async create(data: CreateEmpresaDTO) {
    return await prisma.empresa.create({
      data
    });
  }

  // 4. Actualizar una empresa
  async update(id: string, data: UpdateEmpresaDTO) {
    return await prisma.empresa.update({
      where: { id_empresa: id },
      data
    });
  }

  // 5. "Borrado Lógico" (Soft Delete) - Mejora práctica de auditoría
  async delete(id: string) {
    return await prisma.empresa.update({
      where: { id_empresa: id },
      data: { is_active: false }
    });
  }
}

export const empresaRepository = new EmpresaRepository();