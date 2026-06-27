import request from 'supertest';
import app from '../../src/app';
import { empresaService } from '../../src/services/empresa.service';
import { verifyToken } from '../../src/utils/jwt.util';

jest.mock('../../src/services/empresa.service', () => ({
  empresaService: {
    getAllEmpresas: jest.fn(),
    getEmpresaById: jest.fn(),
    createEmpresa: jest.fn(),
    updateEmpresa: jest.fn(),
    deleteEmpresa: jest.fn(),
  },
}));

jest.mock('../../src/utils/jwt.util', () => ({
  verifyToken: jest.fn(),
}));

describe('Empresa Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/empresas', () => {
    it('debería retornar 201 y la empresa creada', async () => {
      const mockNewEmpresa = {
        razon_social: 'EcoAcopio Test S.A.C.',
        ruc: '20123456789',
        direccion: 'Calle Verde 123',
        telefono: '987654321',
        email: 'contacto@ecotest.com',
      };
      const mockCreated = { id_empresa: 'empresa-123', ...mockNewEmpresa, is_active: true };
      (empresaService.createEmpresa as jest.Mock).mockResolvedValueOnce(mockCreated);

      const response = await request(app)
        .post('/api/v1/empresas')
        .send(mockNewEmpresa)
        .expect(201);

      expect(response.body).toEqual(mockCreated);
      expect(empresaService.createEmpresa).toHaveBeenCalledWith(mockNewEmpresa);
    });

    it('debería retornar 400 si falla la creación de la empresa', async () => {
      (empresaService.createEmpresa as jest.Mock).mockRejectedValueOnce(new Error('Ya existe una empresa registrada con este RUC'));

      const response = await request(app)
        .post('/api/v1/empresas')
        .send({ razon_social: 'EcoAcopio Test S.A.C.' })
        .expect(400);

      expect(response.body).toEqual({ error: 'Ya existe una empresa registrada con este RUC' });
    });
  });

  describe('GET /api/v1/empresas', () => {
    it('debería retornar 401 si no está autenticado', async () => {
      await request(app)
        .get('/api/v1/empresas')
        .expect(401);
    });

    it('debería retornar 200 y la lista de empresas si está autenticado', async () => {
      (verifyToken as jest.Mock).mockReturnValueOnce({ id_usuario: 'user-123', id_empresa: 'empresa-123' });
      const mockEmpresas = [{ id_empresa: 'empresa-123', razon_social: 'Empresa 1' }];
      (empresaService.getAllEmpresas as jest.Mock).mockResolvedValueOnce(mockEmpresas);

      const response = await request(app)
        .get('/api/v1/empresas')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual(mockEmpresas);
      expect(empresaService.getAllEmpresas).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/empresas/:id', () => {
    it('debería retornar 200 y los detalles de la empresa si existe', async () => {
      (verifyToken as jest.Mock).mockReturnValueOnce({ id_usuario: 'user-123', id_empresa: 'empresa-123' });
      const mockEmpresa = { id_empresa: 'empresa-123', razon_social: 'Empresa 1' };
      (empresaService.getEmpresaById as jest.Mock).mockResolvedValueOnce(mockEmpresa);

      const response = await request(app)
        .get('/api/v1/empresas/empresa-123')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual(mockEmpresa);
      expect(empresaService.getEmpresaById).toHaveBeenCalledWith('empresa-123');
    });

    it('debería retornar 404 si la empresa no existe', async () => {
      (verifyToken as jest.Mock).mockReturnValueOnce({ id_usuario: 'user-123', id_empresa: 'empresa-123' });
      (empresaService.getEmpresaById as jest.Mock).mockRejectedValueOnce(new Error('Empresa no encontrada'));

      const response = await request(app)
        .get('/api/v1/empresas/empresa-no-existe')
        .set('Authorization', 'Bearer token-valido')
        .expect(404);

      expect(response.body).toEqual({ error: 'Empresa no encontrada' });
    });
  });

  describe('PUT /api/v1/empresas/:id', () => {
    it('debería retornar 200 y la empresa actualizada', async () => {
      (verifyToken as jest.Mock).mockReturnValueOnce({ id_usuario: 'user-123', id_empresa: 'empresa-123' });
      const updateData = { razon_social: 'Empresa Modificada S.A.C.' };
      const mockUpdated = { id_empresa: 'empresa-123', ruc: '20123456789', ...updateData };
      (empresaService.updateEmpresa as jest.Mock).mockResolvedValueOnce(mockUpdated);

      const response = await request(app)
        .put('/api/v1/empresas/empresa-123')
        .set('Authorization', 'Bearer token-valido')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockUpdated);
      expect(empresaService.updateEmpresa).toHaveBeenCalledWith('empresa-123', {
        id_empresa: 'empresa-123', // Inyectado por el middleware verifyTenant en req.body
        ...updateData,
      });
    });
  });

  describe('DELETE /api/v1/empresas/:id', () => {
    it('debería retornar 200 si la empresa se desactiva correctamente', async () => {
      (verifyToken as jest.Mock).mockReturnValueOnce({ id_usuario: 'user-123', id_empresa: 'empresa-123' });
      (empresaService.deleteEmpresa as jest.Mock).mockResolvedValueOnce(undefined);

      const response = await request(app)
        .delete('/api/v1/empresas/empresa-123')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual({ message: 'Empresa desactivada correctamente' });
      expect(empresaService.deleteEmpresa).toHaveBeenCalledWith('empresa-123');
    });
  });
});
