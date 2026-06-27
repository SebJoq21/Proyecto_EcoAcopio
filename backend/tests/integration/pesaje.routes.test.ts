import request from 'supertest';
import app from '../../src/app';
import { pesajeService } from '../../src/services/pesaje.service';
import { verifyToken } from '../../src/utils/jwt.util';

jest.mock('../../src/services/pesaje.service', () => ({
  pesajeService: {
    getPesajesByEmpresa: jest.fn(),
    getPesajeById: jest.fn(),
    createPesaje: jest.fn(),
    updatePesaje: jest.fn(),
    anularPesaje: jest.fn(),
  },
}));

jest.mock('../../src/utils/jwt.util', () => ({
  verifyToken: jest.fn(),
}));

describe('Pesaje Routes', () => {
  const mockTenantUser = { id_usuario: 'user-123', id_empresa: 'empresa-123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/pesajes', () => {
    it('debería retornar 200 y la lista de pesajes de la empresa', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockPesajes = [{ id_pesaje: 'pes-1', peso_kg: 50 }];
      (pesajeService.getPesajesByEmpresa as jest.Mock).mockResolvedValueOnce(mockPesajes);

      const response = await request(app)
        .get('/api/v1/pesajes')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual(mockPesajes);
      expect(pesajeService.getPesajesByEmpresa).toHaveBeenCalledWith('empresa-123');
    });
  });

  describe('GET /api/v1/pesajes/:id', () => {
    it('debería retornar 200 y el pesaje si existe', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockPesaje = { id_pesaje: 'pes-1', peso_kg: 50 };
      (pesajeService.getPesajeById as jest.Mock).mockResolvedValueOnce(mockPesaje);

      const response = await request(app)
        .get('/api/v1/pesajes/pes-1')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual(mockPesaje);
      expect(pesajeService.getPesajeById).toHaveBeenCalledWith('pes-1');
    });

    it('debería retornar 404 si el pesaje no existe', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      (pesajeService.getPesajeById as jest.Mock).mockRejectedValueOnce(new Error('Pesaje no encontrado'));

      const response = await request(app)
        .get('/api/v1/pesajes/pes-invalido')
        .set('Authorization', 'Bearer token-valido')
        .expect(404);

      expect(response.body).toEqual({ error: 'Pesaje no encontrado' });
    });
  });

  describe('POST /api/v1/pesajes', () => {
    it('debería retornar 201 y el pesaje creado, inyectando el id_usuario en el cuerpo', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const inputBody = { peso_kg: 100 };
      const mockCreated = { id_pesaje: 'pes-2', id_empresa: 'empresa-123', id_usuario: 'user-123', peso_kg: 100 };
      (pesajeService.createPesaje as jest.Mock).mockResolvedValueOnce(mockCreated);

      const response = await request(app)
        .post('/api/v1/pesajes')
        .set('Authorization', 'Bearer token-valido')
        .send(inputBody)
        .expect(201);

      expect(response.body).toEqual(mockCreated);
      expect(pesajeService.createPesaje).toHaveBeenCalledWith({
        id_empresa: 'empresa-123',
        id_usuario: 'user-123',
        peso_kg: 100,
      });
    });
  });

  describe('PUT /api/v1/pesajes/:id', () => {
    it('debería retornar 200 y el pesaje actualizado', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const updateData = { peso_kg: 120 };
      const mockUpdated = { id_pesaje: 'pes-2', id_empresa: 'empresa-123', peso_kg: 120 };
      (pesajeService.updatePesaje as jest.Mock).mockResolvedValueOnce(mockUpdated);

      const response = await request(app)
        .put('/api/v1/pesajes/pes-2')
        .set('Authorization', 'Bearer token-valido')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockUpdated);
      expect(pesajeService.updatePesaje).toHaveBeenCalledWith('pes-2', {
        id_empresa: 'empresa-123',
        peso_kg: 120,
      });
    });
  });

  describe('DELETE /api/v1/pesajes/:id', () => {
    it('debería retornar 200 al anular el pesaje', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      (pesajeService.anularPesaje as jest.Mock).mockResolvedValueOnce(undefined);

      const response = await request(app)
        .delete('/api/v1/pesajes/pes-2')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual({ message: 'Ticket de pesaje anulado correctamente' });
      expect(pesajeService.anularPesaje).toHaveBeenCalledWith('pes-2');
    });
  });
});
