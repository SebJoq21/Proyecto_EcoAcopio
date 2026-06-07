import { inventarioRepository } from '../repositories/inventario.repository';

export class InventarioService {
  async getInventarioByEmpresa(id_empresa: string) {
    return await inventarioRepository.findAllByEmpresa(id_empresa);
  }

  async updateStockMinimo(id_inventario: string, stock_minimo_kg: number) {
    const registroExistente = await inventarioRepository.findById(id_inventario);
    if (!registroExistente) {
      throw new Error('El registro de inventario solicitado no existe.');
    }
    return await inventarioRepository.updateStockMinimo(id_inventario, stock_minimo_kg);
  }
}

export const inventarioService = new InventarioService();