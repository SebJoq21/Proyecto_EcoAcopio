import prisma from '../config/prisma';
import { CreatePesajeDTO, UpdatePesajeDTO } from '../types/pesaje.dto';

export class PesajeRepository {
  // 1. Obtener todos los pesajes de una empresa con sus datos relacionados
  async findAllByEmpresa(id_empresa: string) {
    return await prisma.pesaje.findMany({
      where: { id_empresa: id_empresa },
      include: {
        material: { select: { nombre: true, etiqueta: true, emoji: true, categoria: { select: { nombre: true } } } },
        proveedor: { select: { nombre_completo: true, numero_documento: true } },
        usuario: { select: { nombres: true, apellidos: true } }
      },
      orderBy: { fecha_creacion: 'desc' }
    });
  }

  // 2. Buscar un pesaje por su ID exacto
  async findById(id: string) {
    return await prisma.pesaje.findUnique({
      where: { id_pesaje: id },
      include: {
        material: { select: { nombre: true, etiqueta: true, emoji: true, categoria: { select: { nombre: true } } } },
        proveedor: { select: { nombre_completo: true, numero_documento: true } },
        usuario: { select: { nombres: true, apellidos: true } }
      }
    });
  }

  // 3. Crear un nuevo ticket de pesaje
  async create(data: CreatePesajeDTO) {
    return await prisma.pesaje.create({
      data
    });
  }

  // 4. Actualizar un pesaje (Para correcciones o cambios de estado)
  async update(id: string, data: UpdatePesajeDTO) {
    return await prisma.pesaje.update({
      where: { id_pesaje: id },
      data
    });
  }

  // 5. Borrado Lógico Contable (Cambiar estado a "Anulado")
  // Nota: En tablas transaccionales jamás se borra la fila física (delete). 
  // Se cambia el estado para dejar evidencia de la auditoría.
  async anular(id: string) {
    return await prisma.pesaje.update({
      where: { id_pesaje: id },
      data: { estado: 'Anulado' }
    });
  }
}

export const pesajeRepository = new PesajeRepository();