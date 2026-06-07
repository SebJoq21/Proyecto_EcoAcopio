import { proveedorRepository } from '../repositories/proveedor.repository';
import { CreateProveedorDTO, UpdateProveedorDTO } from '../types/proveedor.dto';
import prisma from '../config/prisma';

export class ProveedorService {
  async getProveedoresByEmpresa(id_empresa: string) {
    return await proveedorRepository.findAllByEmpresa(id_empresa);
  }

  async getProveedorById(id: string) {
    const proveedor = await proveedorRepository.findById(id);
    if (!proveedor) throw new Error('Proveedor no encontrado');
    return proveedor;
  }

  async createProveedor(data: CreateProveedorDTO) {
    // Regla de Negocio: Validar duplicidad de documento SOLO si se envía un número
    if (data.numero_documento) {
      const existeDocumento = await prisma.proveedor.findFirst({
        where: {
          id_empresa: data.id_empresa,
          numero_documento: data.numero_documento
        }
      });

      if (existeDocumento) {
        throw new Error(`Ya existe un proveedor registrado con el documento ${data.numero_documento} en esta empresa.`);
      }
    }

    return await proveedorRepository.create(data);
  }

  async updateProveedor(id: string, data: UpdateProveedorDTO) {
    await this.getProveedorById(id); // Verificamos que exista
    return await proveedorRepository.update(id, data);
  }

  async deleteProveedor(id: string) {
    await this.getProveedorById(id); // Verificamos que exista
    return await proveedorRepository.delete(id); // Borrado lógico
  }
}

export const proveedorService = new ProveedorService();