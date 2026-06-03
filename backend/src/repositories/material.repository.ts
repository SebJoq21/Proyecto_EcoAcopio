import prisma from '../config/prisma';
import { CreateMaterialDTO, UpdateMaterialDTO } from '../types/material.dto';

export class MaterialRepository {
  // 1. Obtener todos los materiales activos de una empresa
  async findAllByEmpresa(id_empresa: string) {
    return await prisma.material.findMany({
      where: { 
        id_empresa: id_empresa,
        activo: true // Solo traemos los que no han sido "eliminados"
      },
      // Traemos los datos de la categoría asociada
      include: {
        categoria: {
          select: { nombre: true }
        }
      }
    });
  }

  // 2. Buscar un material por su ID
  async findById(id: string) {
    return await prisma.material.findUnique({
      where: { id_material: id },
      include: {
        categoria: { select: { nombre: true } }
      }
    });
  }

  // 3. Crear un nuevo material
  async create(data: CreateMaterialDTO) {
    return await prisma.material.create({
      data
    });
  }

  // 4. Actualizar un material
  async update(id: string, data: UpdateMaterialDTO) {
    return await prisma.material.update({
      where: { id_material: id },
      data
    });
  }

  // 5. Borrado lógico (Desactivar en lugar de borrar físicamente)
  async delete(id: string) {
    return await prisma.material.update({
      where: { id_material: id },
      data: { activo: false }
    });
  }
}

export const materialRepository = new MaterialRepository();