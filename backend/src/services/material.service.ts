import { materialRepository } from '../repositories/material.repository';
import { CreateMaterialDTO, UpdateMaterialDTO } from '../types/material.dto';
import prisma from '../config/prisma';

export class MaterialService {
  async getMaterialesByEmpresa(id_empresa: string) {
    return await materialRepository.findAllByEmpresa(id_empresa);
  }

  async getMaterialById(id: string) {
    const material = await materialRepository.findById(id);
    if (!material) throw new Error('Material no encontrado');
    return material;
  }

  async createMaterial(data: CreateMaterialDTO) {
    // Regla de Negocio 1: La categoría DEBE existir y pertenecer a la misma empresa
    const categoriaValida = await prisma.categoriaMaterial.findFirst({
      where: {
        id_categoria: data.id_categoria,
        id_empresa: data.id_empresa
      }
    });

    if (!categoriaValida) {
      throw new Error('Operación rechazada: La categoría seleccionada no existe o pertenece a otra empresa.');
    }

    // Regla de Negocio 2: Evitar que existan dos materiales con la misma etiqueta exacta en la misma empresa
    const etiquetaDuplicada = await prisma.material.findFirst({
      where: {
        id_empresa: data.id_empresa,
        etiqueta: data.etiqueta
      }
    });

    if (etiquetaDuplicada) {
      throw new Error(`Ya existe un material registrado con la etiqueta ${data.etiqueta}`);
    }

    return await materialRepository.create(data);
  }

  async updateMaterial(id: string, data: UpdateMaterialDTO) {
    await this.getMaterialById(id); // Validamos que exista antes de intentar actualizar
    return await materialRepository.update(id, data);
  }

  async deleteMaterial(id: string) {
    await this.getMaterialById(id); // Validamos que exista
    return await materialRepository.delete(id); // Recuerda que este es un borrado lógico (activo = false)
  }
}

export const materialService = new MaterialService();