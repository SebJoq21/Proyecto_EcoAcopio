import prisma from '../config/prisma';
import { CreateCategoriaDTO, UpdateCategoriaDTO } from '../types/categoria.dto';

export class CategoriaRepository {
  // 1. Obtener todas las categorías, pero SOLO de una empresa específica
  async findAllByEmpresa(id_empresa: string) {
    return await prisma.categoriaMaterial.findMany({
      where: { id_empresa: id_empresa },
      orderBy: { fecha_creacion: 'desc' }
    });
  }

  // 2. Buscar una categoría por su ID
  async findById(id: string) {
    return await prisma.categoriaMaterial.findUnique({
      where: { id_categoria: id }
    });
  }

  // 3. Crear una nueva categoría
  async create(data: CreateCategoriaDTO) {
    return await prisma.categoriaMaterial.create({
      data
    });
  }

  // 4. Actualizar el nombre de una categoría
  async update(id: string, data: UpdateCategoriaDTO) {
    return await prisma.categoriaMaterial.update({
      where: { id_categoria: id },
      data
    });
  }

  // 5. Borrado físico (esta tabla no tiene borrado lógico en tu diseño SQL)
  async delete(id: string) {
    return await prisma.categoriaMaterial.delete({
      where: { id_categoria: id }
    });
  }
}

export const categoriaRepository = new CategoriaRepository();