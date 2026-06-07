import prisma from '../config/prisma';
import { CreateProveedorDTO, UpdateProveedorDTO } from '../types/proveedor.dto';

export class ProveedorRepository {
  // 1. Obtener todos los proveedores activos de una empresa
  async findAllByEmpresa(id_empresa: string) {
    return await prisma.proveedor.findMany({
      where: { 
        id_empresa: id_empresa,
        activo: true
      },
      orderBy: { fecha_creacion: 'desc' }
    });
  }

  // 2. Buscar un proveedor por su ID
  async findById(id: string) {
    return await prisma.proveedor.findUnique({
      where: { id_provider: id } // Usamos id_provider tal como está en el schema.prisma
    });
  }

  // 3. Crear un nuevo proveedor
  async create(data: CreateProveedorDTO) {
    return await prisma.proveedor.create({
      data
    });
  }

  // 4. Actualizar un proveedor
  async update(id: string, data: UpdateProveedorDTO) {
    return await prisma.proveedor.update({
      where: { id_provider: id },
      data
    });
  }

  // 5. Borrado lógico (Desactivar)
  async delete(id: string) {
    return await prisma.proveedor.update({
      where: { id_provider: id },
      data: { activo: false }
    });
  }
}

export const proveedorRepository = new ProveedorRepository();