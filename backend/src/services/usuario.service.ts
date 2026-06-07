import { usuarioRepository } from '../repositories/usuario.repository';
import { CreateUsuarioDTO, UpdateUsuarioDTO } from '../types/usuario.dto';
import prisma from '../config/prisma';

export class UsuarioService {
  async getUsuariosByEmpresa(id_empresa: string) {
    return await usuarioRepository.findAllByEmpresa(id_empresa);
  }

  async getUsuarioById(id: string) {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) throw new Error('Usuario no encontrado');
    return usuario;
  }

  async createUsuario(data: CreateUsuarioDTO) {
    // Regla de Negocio: El email debe ser único DENTRO de la empresa
    const emailExistente = await prisma.usuario.findFirst({
      where: {
        id_empresa: data.id_empresa,
        email: data.email
      }
    });

    if (emailExistente) {
      throw new Error(`El correo ${data.email} ya está registrado en esta empresa.`);
    }

    // (Aquí más adelante agregaremos la encriptación de la contraseña)
    return await usuarioRepository.create(data);
  }

  async updateUsuario(id: string, data: UpdateUsuarioDTO) {
    await this.getUsuarioById(id); // Verificamos que exista
    return await usuarioRepository.update(id, data);
  }

  async deleteUsuario(id: string) {
    await this.getUsuarioById(id); // Verificamos que exista
    return await usuarioRepository.delete(id); // Borrado lógico
  }
}

export const usuarioService = new UsuarioService();