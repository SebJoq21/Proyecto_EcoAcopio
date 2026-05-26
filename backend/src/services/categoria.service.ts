import { categoriaRepository } from '../repositories/categoria.repository';
import { CreateCategoriaDTO, UpdateCategoriaDTO } from '../types/categoria.dto';
import prisma from '../config/prisma';

export class CategoriaService {
  async getCategoriasByEmpresa(id_empresa: string) {
    return await categoriaRepository.findAllByEmpresa(id_empresa);
  }

  async getCategoriaById(id: string) {
    const categoria = await categoriaRepository.findById(id);
    if (!categoria) throw new Error('Categoría no encontrada');
    return categoria;
  }

  async createCategoria(data: CreateCategoriaDTO) {
    // Regla de Negocio: Evitar nombres duplicados dentro de la MISMA empresa
    const existe = await prisma.categoriaMaterial.findFirst({
      where: {
        id_empresa: data.id_empresa,
        nombre: data.nombre,
      },
    });
    
    if (existe) throw new Error('Ya existe una categoría con este nombre en tu empresa');

    return await categoriaRepository.create(data);
  }

  async updateCategoria(id: string, data: UpdateCategoriaDTO) {
    await this.getCategoriaById(id); // Verificamos que exista primero
    return await categoriaRepository.update(id, data);
  }

  async deleteCategoria(id: string) {
    await this.getCategoriaById(id); // Verificamos que exista primero
    return await categoriaRepository.delete(id);
  }
}

export const categoriaService = new CategoriaService();