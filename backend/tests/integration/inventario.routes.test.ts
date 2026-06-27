import request from 'supertest';
import app from '../../src/app';
import { inventarioService } from '../../src/services/inventario.service';
import { verifyToken } from '../../src/utils/jwt.util';

jest.mock('../../src/services/inventario.service', () => ({
  inventarioService: {
    getInventarioByEmpresa: jest.fn(),
    updateStockMinimo: jest.fn(),
  },
}));

jest.mock('../../src/utils/jwt.util', () => ({
  verifyToken: jest.fn(),
}));

describe('Inventario Routes', () => {
  const mockTenantUser = { id_usuario: 'user-123', id_empresa: 'empresa-123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/inventario', () => {
    it('debería retornar 200 y el inventario de la empresa', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockInventario = [{ id_inventario: 'inv-1', stock_kg: 500, stock_minimo_kg: 100 }];
      (inventarioService.getInventarioByEmpresa as jest.Mock).mockResolvedValueOnce(mockInventario);

      const response = await request(app)
        .get('/api/v1/inventario')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual(mockInventario);
      expect(inventarioService.getInventarioByEmpresa).toHaveBeenCalledWith('empresa-123');
    });
  });

  describe('PUT /api/v1/inventario/:id/stock-minimo', () => {
    it('debería retornar 200 y el inventario actualizado si el stock mínimo es válido', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockUpdated = { id_inventario: 'inv-1', stock_minimo_kg: 150 };
      (inventarioService.updateStockMinimo as jest.Mock).mockResolvedValueOnce(mockUpdated);

      const response = await request(app)
        .put('/api/v1/inventario/inv-1/stock-minimo')
        .set('Authorization', 'Bearer token-valido')
        .send({ stock_minimo_kg: 150 })
        .expect(200);

      expect(response.body).toEqual(mockUpdated);
      expect(inventarioService.updateStockMinimo).toHaveBeenCalledWith('inv-1', 150);
    });

    it('debería retornar 400 si el stock mínimo es menor que 0', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);

      const response = await request(app)
        .put('/api/v1/inventario/inv-1/stock-minimo')
        .set('Authorization', 'Bearer token-valido')
        .send({ stock_minimo_kg: -5 })
        .expect(400);

      expect(response.body).toEqual({ error: 'El stock mínimo es requerido y debe ser un número igual o mayor a 0' });
    });

    it('debería retornar 400 si el stock mínimo no se proporciona', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);

      const response = await request(app)
        .put('/api/v1/inventario/inv-1/stock-minimo')
        .set('Authorization', 'Bearer token-valido')
        .send({})
        .expect(400);

      expect(response.body).toEqual({ error: 'El stock mínimo es requerido y debe ser un número igual o mayor a 0' });
    });
  });
});
