import { materialService } from '../../src/services/material.service';
import prisma from '../../src/config/prisma';
import { materialRepository } from '../../src/repositories/material.repository';

// Mock del cliente de Prisma y del Repositorio
jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    categoriaMaterial: {
      findFirst: jest.fn(),
    },
    material: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('../../src/repositories/material.repository', () => ({
  materialRepository: {
    findAllByEmpresa: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('MaterialService', () => {
  const mockMaterialData = {
    id_empresa: 'empresa-1111-2222',
    id_categoria: 'categoria-3333-4444',
    etiqueta: 'PET',
    nombre: 'Plástico PET Transparente',
    precio_referencial_kg: 1.50,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMaterial', () => {
    it('debería registrar un material exitosamente si la categoría existe y la etiqueta es única', async () => {
      // 1. Simular categoría válida (perteneciente a la misma empresa)
      (prisma.categoriaMaterial.findFirst as jest.Mock).mockResolvedValueOnce({
        id_categoria: mockMaterialData.id_categoria,
        id_empresa: mockMaterialData.id_empresa,
      });

      // 2. Simular etiqueta no duplicada
      (prisma.material.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const mockCreated = { id_material: 'material-uuid', ...mockMaterialData, activo: true };
      (materialRepository.create as jest.Mock).mockResolvedValueOnce(mockCreated);

      const result = await materialService.createMaterial(mockMaterialData);

      expect(result).toEqual(mockCreated);
      expect(prisma.categoriaMaterial.findFirst).toHaveBeenCalledWith({
        where: {
          id_categoria: mockMaterialData.id_categoria,
          id_empresa: mockMaterialData.id_empresa,
        },
      });
      expect(prisma.material.findFirst).toHaveBeenCalledWith({
        where: {
          id_empresa: mockMaterialData.id_empresa,
          etiqueta: mockMaterialData.etiqueta,
        },
      });
      expect(materialRepository.create).toHaveBeenCalledWith(mockMaterialData);
    });

    it('debería lanzar un error si la categoría no existe o pertenece a otra empresa', async () => {
      // Simular que findFirst de categoria devuelve null (no existe o no es de la empresa)
      (prisma.categoriaMaterial.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await expect(materialService.createMaterial(mockMaterialData))
        .rejects
        .toThrow('Operación rechazada: La categoría seleccionada no existe o pertenece a otra empresa.');

      expect(prisma.categoriaMaterial.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.material.findFirst).not.toHaveBeenCalled();
      expect(materialRepository.create).not.toHaveBeenCalled();
    });

    it('debería lanzar un error si la etiqueta ya existe en la misma empresa', async () => {
      // 1. Categoria válida
      (prisma.categoriaMaterial.findFirst as jest.Mock).mockResolvedValueOnce({
        id_categoria: mockMaterialData.id_categoria,
        id_empresa: mockMaterialData.id_empresa,
      });

      // 2. Simular etiqueta duplicada devolviendo un material existente
      (prisma.material.findFirst as jest.Mock).mockResolvedValueOnce({
        id_material: 'existing-material-id',
        etiqueta: 'PET',
      });

      await expect(materialService.createMaterial(mockMaterialData))
        .rejects
        .toThrow(`Ya existe un material registrado con la etiqueta ${mockMaterialData.etiqueta}`);

      expect(prisma.categoriaMaterial.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.material.findFirst).toHaveBeenCalledTimes(1);
      expect(materialRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteMaterial', () => {
    it('debería realizar el borrado lógico si el material existe', async () => {
      const materialId = 'material-to-delete';
      
      // Simular que el material existe al consultar por ID
      (materialRepository.findById as jest.Mock).mockResolvedValueOnce({
        id_material: materialId,
        nombre: 'PET',
      });

      (materialRepository.delete as jest.Mock).mockResolvedValueOnce({
        id_material: materialId,
        activo: false,
      });

      const result = await materialService.deleteMaterial(materialId);

      expect(materialRepository.findById).toHaveBeenCalledWith(materialId);
      expect(materialRepository.delete).toHaveBeenCalledWith(materialId);
      expect(result).toHaveProperty('activo', false);
    });

    it('debería lanzar un error 404/not found si el material a eliminar no existe', async () => {
      const materialId = 'non-existent-material';
      
      // Simular que el material no existe
      (materialRepository.findById as jest.Mock).mockResolvedValueOnce(null);

      await expect(materialService.deleteMaterial(materialId))
        .rejects
        .toThrow('Material no encontrado');

      expect(materialRepository.findById).toHaveBeenCalledWith(materialId);
      expect(materialRepository.delete).not.toHaveBeenCalled();
    });
  });
});
