import prisma from '../config/prisma';

export class InventarioRepository {
  // 1. Listar todo el inventario de la empresa con los detalles del material
  async findAllByEmpresa(id_empresa: string) {
    return await prisma.inventario.findMany({
      where: { id_empresa },
      include: {
        material: {
          select: {
            nombre: true,
            etiqueta: true,
            categoria: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: { stock_kg: 'desc' } // Muestra primero lo que tiene más stock
    });
  }

  // 2. Buscar un registro específico por su ID
  async findById(id_inventario: string) {
    return await prisma.inventario.findUnique({
      where: { id_inventario },
      include: {
        material: { select: { nombre: true } }
      }
    });
  }

  // 3. Actualizar el umbral de stock mínimo
  async updateStockMinimo(id_inventario: string, stock_minimo_kg: number) {
    return await prisma.inventario.update({
      where: { id_inventario },
      data: { stock_minimo_kg }
    });
  }
}

export const inventarioRepository = new InventarioRepository();