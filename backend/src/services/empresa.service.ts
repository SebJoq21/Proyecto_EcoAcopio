import { empresaRepository } from '../repositories/empresa.repository';
import { CreateEmpresaDTO, UpdateEmpresaDTO } from '../types/empresa.dto';
import prisma from '../config/prisma';

export class EmpresaService {
  async getAllEmpresas() {
    return await empresaRepository.findAll();
  }

  async getEmpresaById(id: string) {
    const empresa = await empresaRepository.findById(id);
    if (!empresa) throw new Error('Empresa no encontrada');
    return empresa;
  }

  async createEmpresa(data: CreateEmpresaDTO) {
    // Regla de Negocio 1: El RUC debe ser único
    const rucExist = await prisma.empresa.findUnique({ where: { ruc: data.ruc } });
    if (rucExist) throw new Error('Ya existe una empresa registrada con este RUC');

    // Regla de Negocio 2: El Email debe ser único
    const emailExist = await prisma.empresa.findUnique({ where: { email: data.email } });
    if (emailExist) throw new Error('Ya existe una empresa registrada con este Email');

    return await empresaRepository.create(data);
  }

  async updateEmpresa(id: string, data: UpdateEmpresaDTO) {
    await this.getEmpresaById(id); // Primero verificamos que exista
    return await empresaRepository.update(id, data);
  }

  async deleteEmpresa(id: string) {
    await this.getEmpresaById(id); // Verificamos que exista
    return await empresaRepository.delete(id);
  }
}

export const empresaService = new EmpresaService();