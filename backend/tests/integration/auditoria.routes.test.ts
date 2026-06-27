import request from 'supertest';
import app from '../../src/app';
import { auditoriaService } from '../../src/services/auditoria.service';
import { verifyToken } from '../../src/utils/jwt.util';

// Mock del servicio pero preservando la función createAuditExtension para evitar romper Prisma
jest.mock('../../src/services/auditoria.service', () => {
  const actual = jest.requireActual('../../src/services/auditoria.service');
  return {
    ...actual,
    auditoriaService: {
      obtenerHistorial: jest.fn(),
    },
  };
});

jest.mock('../../src/utils/jwt.util', () => ({
  verifyToken: jest.fn(),
}));

describe('Auditoria Routes', () => {
  const mockTenantUser = { id_usuario: 'user-123', id_empresa: 'empresa-123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/auditoria', () => {
    it('debería retornar 200 y el historial de auditorías de la empresa', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockLogs = [{ id_auditoria: 'aud-1', entidad: 'Material', accion: 'CREAR' }];
      (auditoriaService.obtenerHistorial as jest.Mock).mockResolvedValueOnce(mockLogs);

      const response = await request(app)
        .get('/api/v1/auditoria')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual(mockLogs);
      expect(auditoriaService.obtenerHistorial).toHaveBeenCalledWith('empresa-123');
    });

    it('debería retornar 400 si id_empresa no se puede determinar', async () => {
      (verifyToken as jest.Mock).mockReturnValue({ id_usuario: 'user-123' }); // sin id_empresa

      const response = await request(app)
        .get('/api/v1/auditoria')
        .set('Authorization', 'Bearer token-valido')
        .expect(403); // El middleware verifyTenant retorna 403
    });
  });
});
