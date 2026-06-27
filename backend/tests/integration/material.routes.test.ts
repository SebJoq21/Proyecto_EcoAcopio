import request from 'supertest';
import app from '../../src/app';
import { materialService } from '../../src/services/material.service';
import { verifyToken } from '../../src/utils/jwt.util';

jest.mock('../../src/services/material.service', () => ({
  materialService: {
    getMaterialesByEmpresa: jest.fn(),
    getMaterialById: jest.fn(),
    createMaterial: jest.fn(),
    updateMaterial: jest.fn(),
    deleteMaterial: jest.fn(),
  },
}));

jest.mock('../../src/utils/jwt.util', () => ({
  verifyToken: jest.fn(),
}));

describe('Material Routes', () => {
  const mockTenantUser = { id_usuario: 'user-123', id_empresa: 'empresa-123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/materiales', () => {
    it('debería retornar 200 y la lista de materiales de la empresa', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockMateriales = [{ id_material: 'mat-1', nombre: 'Papel' }];
      (materialService.getMaterialesByEmpresa as jest.Mock).mockResolvedValueOnce(mockMateriales);

      const response = await request(app)
        .get('/api/v1/materiales')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual(mockMateriales);
      expect(materialService.getMaterialesByEmpresa).toHaveBeenCalledWith('empresa-123');
    });
  });

  describe('GET /api/v1/materiales/:id', () => {
    it('debería retornar 200 y el material si existe', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockMaterial = { id_material: 'mat-1', nombre: 'Papel' };
      (materialService.getMaterialById as jest.Mock).mockResolvedValueOnce(mockMaterial);

      const response = await request(app)
        .get('/api/v1/materiales/mat-1')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual(mockMaterial);
      expect(materialService.getMaterialById).toHaveBeenCalledWith('mat-1');
    });

    it('debería retornar 404 si el material no existe', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      (materialService.getMaterialById as jest.Mock).mockRejectedValueOnce(new Error('Material no encontrado'));

      const response = await request(app)
        .get('/api/v1/materiales/mat-invalido')
        .set('Authorization', 'Bearer token-valido')
        .expect(404);

      expect(response.body).toEqual({ error: 'Material no encontrado' });
    });
  });

  describe('POST /api/v1/materiales', () => {
    it('debería retornar 201 y el material creado', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const inputBody = { nombre: 'Cartón', etiqueta: 'CAR' };
      const mockCreated = { id_material: 'mat-2', id_empresa: 'empresa-123', nombre: 'Cartón', etiqueta: 'CAR' };
      (materialService.createMaterial as jest.Mock).mockResolvedValueOnce(mockCreated);

      const response = await request(app)
        .post('/api/v1/materiales')
        .set('Authorization', 'Bearer token-valido')
        .send(inputBody)
        .expect(201);

      expect(response.body).toEqual(mockCreated);
      expect(materialService.createMaterial).toHaveBeenCalledWith({
        id_empresa: 'empresa-123',
        nombre: 'Cartón',
        etiqueta: 'CAR',
      });
    });
  });

  describe('PUT /api/v1/materiales/:id', () => {
    it('debería retornar 200 y el material actualizado', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const updateData = { nombre: 'Cartón Corrugado' };
      const mockUpdated = { id_material: 'mat-2', id_empresa: 'empresa-123', nombre: 'Cartón Corrugado' };
      (materialService.updateMaterial as jest.Mock).mockResolvedValueOnce(mockUpdated);

      const response = await request(app)
        .put('/api/v1/materiales/mat-2')
        .set('Authorization', 'Bearer token-valido')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockUpdated);
      expect(materialService.updateMaterial).toHaveBeenCalledWith('mat-2', {
        id_empresa: 'empresa-123',
        nombre: 'Cartón Corrugado',
      });
    });
  });

  describe('DELETE /api/v1/materiales/:id', () => {
    it('debería retornar 200 al desactivar el material', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      (materialService.deleteMaterial as jest.Mock).mockResolvedValueOnce({ id_material: 'mat-2', activo: false });

      const response = await request(app)
        .delete('/api/v1/materiales/mat-2')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual({ message: 'Material desactivado correctamente' });
      expect(materialService.deleteMaterial).toHaveBeenCalledWith('mat-2');
    });
  });
});
