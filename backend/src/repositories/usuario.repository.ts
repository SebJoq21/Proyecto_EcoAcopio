import prisma from '../config/prisma';
import { CreateUsuarioDTO, UpdateUsuarioDTO } from '../types/usuario.dto';

export class UsuarioRepository {
  // 1. Obtener todos los usuarios activos de una empresa
  async findAllByEmpresa(id_empresa: string) {
    return await prisma.usuario.findMany({
      where: { 
        id_empresa: id_empresa,
        activo: true 
      },
      select: {
        id_usuario: true,
        nombres: true,       // Cambiado aquí
        apellidos: true,     // Cambiado aquí
        email: true,
        rol: true,
        fecha_creacion: true
      },
      orderBy: { fecha_creacion: 'desc' }
    });
  }

  // 2. Buscar un usuario por su ID
  async findById(id: string) {
    return await prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: {
        id_usuario: true,
        id_empresa: true,
        nombres: true,       // Cambiado aquí
        apellidos: true,     // Cambiado aquí
        email: true,
        rol: true,
        activo: true
      }
    });
  }

  // 3. Buscar un usuario por Email (Para el futuro sistema de Login)
  // Aquí SÍ traemos el password_hash para poder compararlo
  async findByEmail(email: string) {
    return await prisma.usuario.findFirst({
      where: { email: email }
    });
  }

  // 4. Crear un nuevo usuario
  async create(data: CreateUsuarioDTO) {
    return await prisma.usuario.create({
      data
    });
  }

  // 5. Actualizar un usuario
  async update(id: string, data: UpdateUsuarioDTO) {
    return await prisma.usuario.update({
      where: { id_usuario: id },
      data
    });
  }

  // 6. Borrado lógico (Desactivar en lugar de borrar físicamente)
  async delete(id: string) {
    return await prisma.usuario.update({
      where: { id_usuario: id },
      data: { activo: false }
    });
  }
}

export const usuarioRepository = new UsuarioRepository();