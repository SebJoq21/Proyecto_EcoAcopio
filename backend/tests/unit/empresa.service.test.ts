import { empresaService } from '../../src/services/empresa.service';
import prisma from '../../src/config/prisma';
import { empresaRepository } from '../../src/repositories/empresa.repository';

// Mock del cliente de Prisma y de las funciones que llamaremos
jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    empresa: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../src/repositories/empresa.repository', () => ({
  empresaRepository: {
    create: jest.fn(),
  },
}));

describe('EmpresaService - createEmpresa', () => {
  const mockEmpresaData = {
    razon_social: 'Empresa Test S.A.C.',
    ruc: '20123456789',
    direccion: 'Av. Test 123',
    telefono: '987654321',
    email: 'contacto@empresatest.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería registrar una empresa exitosamente si el RUC y Email son únicos', async () => {
    // Simulamos que el RUC no existe
    (prisma.empresa.findUnique as jest.Mock).mockResolvedValueOnce(null);
    // Simulamos que el Email no existe
    (prisma.empresa.findUnique as jest.Mock).mockResolvedValueOnce(null);
    
    const mockCreated = { id_empresa: 'mocked-uuid', ...mockEmpresaData, is_active: true };
    (empresaRepository.create as jest.Mock).mockResolvedValueOnce(mockCreated);

    const result = await empresaService.createEmpresa(mockEmpresaData);

    expect(result).toEqual(mockCreated);
    expect(prisma.empresa.findUnique).toHaveBeenCalledTimes(2);
    expect(empresaRepository.create).toHaveBeenCalledWith(mockEmpresaData);
  });

  it('debería lanzar un error si el RUC ya está registrado', async () => {
    // Simulamos que el RUC ya existe devolviendo una empresa ficticia
    (prisma.empresa.findUnique as jest.Mock).mockResolvedValueOnce({ id_empresa: 'existing-id' });

    await expect(empresaService.createEmpresa(mockEmpresaData))
      .rejects
      .toThrow('Ya existe una empresa registrada con este RUC');

    expect(prisma.empresa.findUnique).toHaveBeenCalledTimes(1);
    expect(empresaRepository.create).not.toHaveBeenCalled();
  });

  it('debería lanzar un error si el Email ya está registrado', async () => {
    // Simulamos que el RUC NO existe
    (prisma.empresa.findUnique as jest.Mock).mockResolvedValueOnce(null);
    // Simulamos que el Email SÍ existe
    (prisma.empresa.findUnique as jest.Mock).mockResolvedValueOnce({ id_empresa: 'existing-id' });

    await expect(empresaService.createEmpresa(mockEmpresaData))
      .rejects
      .toThrow('Ya existe una empresa registrada con este Email');

    expect(prisma.empresa.findUnique).toHaveBeenCalledTimes(2);
    expect(empresaRepository.create).not.toHaveBeenCalled();
  });
});
