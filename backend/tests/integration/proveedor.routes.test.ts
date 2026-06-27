import request from 'supertest';
import app from '../../src/app';
import { proveedorService } from '../../src/services/proveedor.service';
import { verifyToken } from '../../src/utils/jwt.util';

jest.mock('../../src/services/proveedor.service', () => ({
  proveedorService: {
    getProveedoresByEmpresa: jest.fn(),
    getProveedorById: jest.fn(),
    createProveedor: jest.fn(),
    updateProveedor: jest.fn(),
    deleteProveedor: jest.fn(),
  },
}));

jest.mock('../../src/utils/jwt.util', () => ({
  verifyToken: jest.fn(),
}));

describe('Proveedor Routes', () => {
  const mockTenantUser = { id_usuario: 'user-123', id_empresa: 'empresa-123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/proveedores', () => {
    it('debería retornar 200 y la lista de proveedores de la empresa', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockProveedores = [{ id_provider: 'prov-1', nombre_completo: 'Proveedor Uno' }];
      (proveedorService.getProveedoresByEmpresa as jest.Mock).mockResolvedValueOnce(mockProveedores);

      const response = await request(app)
        .get('/api/v1/proveedores')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual(mockProveedores);
      expect(proveedorService.getProveedoresByEmpresa).toHaveBeenCalledWith('empresa-123');
    });
  });

  describe('GET /api/v1/proveedores/:id', () => {
    it('debería retornar 200 y el proveedor si existe', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockProveedor = { id_provider: 'prov-1', nombre_completo: 'Proveedor Uno' };
      (proveedorService.getProveedorById as jest.Mock).mockResolvedValueOnce(mockProveedor);

      const response = await request(app)
        .get('/api/v1/proveedores/prov-1')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual(mockProveedor);
      expect(proveedorService.getProveedorById).toHaveBeenCalledWith('prov-1');
    });

    it('debería retornar 404 si el proveedor no existe', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      (proveedorService.getProveedorById as jest.Mock).mockRejectedValueOnce(new Error('Proveedor no encontrado'));

      const response = await request(app)
        .get('/api/v1/proveedores/prov-invalido')
        .set('Authorization', 'Bearer token-valido')
        .expect(404);

      expect(response.body).toEqual({ error: 'Proveedor no encontrado' });
    });
  });

  describe('POST /api/v1/proveedores', () => {
    it('debería retornar 201 y el proveedor creado', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const inputBody = { nombre_completo: 'Proveedor Nuevo' };
      const mockCreated = { id_provider: 'prov-2', id_empresa: 'empresa-123', nombre_completo: 'Proveedor Nuevo' };
      (proveedorService.createProveedor as jest.Mock).mockResolvedValueOnce(mockCreated);

      const response = await request(app)
        .post('/api/v1/proveedores')
        .set('Authorization', 'Bearer token-valido')
        .send(inputBody)
        .expect(201);

      expect(response.body).toEqual(mockCreated);
      expect(proveedorService.createProveedor).toHaveBeenCalledWith({
        id_empresa: 'empresa-123',
        nombre_completo: 'Proveedor Nuevo',
      });
    });
  });

  describe('PUT /api/v1/proveedores/:id', () => {
    it('debería retornar 200 y el proveedor actualizado', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const updateData = { nombre_completo: 'Proveedor Modificado' };
      const mockUpdated = { id_provider: 'prov-2', id_empresa: 'empresa-123', nombre_completo: 'Proveedor Modificado' };
      (proveedorService.updateProveedor as jest.Mock).mockResolvedValueOnce(mockUpdated);

      const response = await request(app)
        .put('/api/v1/proveedores/prov-2')
        .set('Authorization', 'Bearer token-valido')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockUpdated);
      expect(proveedorService.updateProveedor).toHaveBeenCalledWith('prov-2', {
        id_empresa: 'empresa-123',
        nombre_completo: 'Proveedor Modificado',
      });
    });
  });

  describe('DELETE /api/v1/proveedores/:id', () => {
    it('debería retornar 200 al desactivar el proveedor', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      (proveedorService.deleteProveedor as jest.Mock).mockResolvedValueOnce({ id_provider: 'prov-2', activo: false });

      const response = await request(app)
        .delete('/api/v1/proveedores/prov-2')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual({ message: 'Proveedor desactivado correctamente' });
      expect(proveedorService.deleteProveedor).toHaveBeenCalledWith('prov-2');
    });
  });
});
