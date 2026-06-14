import prisma from '../config/prisma';
import { CreateEmpresaDTO, UpdateEmpresaDTO } from '../types/empresa.dto';
import { hashPassword } from '../utils/bcrypt.util';

export class EmpresaRepository {
  // 1. Obtener todas las empresas activas
  async findAll() {
    return await prisma.empresa.findMany({
      where: { is_active: true },
      orderBy: { fecha_creacion: 'desc' }
    });
  }

  // 2. Buscar una empresa por su ID
  async findById(id: string) {
    return await prisma.empresa.findUnique({
      where: { id_empresa: id }
    });
  }

  // 3. Crear una nueva empresa con su administrador
  async create(data: CreateEmpresaDTO) {
    const { usuario, ...empresaData } = data;
    const contrasenaHash = await hashPassword(usuario.password);
    return await prisma.empresa.create({
      data: {
        ...empresaData,
        usuarios: {
          create: {
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            email: usuario.email,
            contrasena: contrasenaHash,
            rol: "admin"
          }
        }
      }
    });
  }

  // 4. Actualizar una empresa
  async update(id: string, data: UpdateEmpresaDTO) {
    return await prisma.empresa.update({
      where: { id_empresa: id },
      data
    });
  }

  // 5. "Borrado Lógico" (Soft Delete) - Mejora práctica de auditoría
  async delete(id: string) {
    return await prisma.empresa.update({
      where: { id_empresa: id },
      data: { is_active: false }
    });
  }
}

export const empresaRepository = new EmpresaRepository();