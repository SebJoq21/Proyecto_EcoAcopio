import request from 'supertest';
import app from '../../src/app';
import { cierreService } from '../../src/services/cierre.service';
import { verifyToken } from '../../src/utils/jwt.util';

jest.mock('../../src/services/cierre.service', () => ({
  cierreService: {
    getCierresByEmpresa: jest.fn(),
    obtenerReporteDinamico: jest.fn(),
    generarCierreMensual: jest.fn(),
    exportarCSV: jest.fn(),
  },
}));

jest.mock('../../src/utils/jwt.util', () => ({
  verifyToken: jest.fn(),
}));

describe('Cierre Routes', () => {
  const mockTenantUser = { id_usuario: 'user-123', id_empresa: 'empresa-123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/cierres', () => {
    it('debería retornar 200 y los cierres de la empresa si no se pasa mes/año', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockCierres = [{ id_cierre: 'cierre-1', mes: 5, anio: 2026 }];
      (cierreService.getCierresByEmpresa as jest.Mock).mockResolvedValueOnce(mockCierres);

      const response = await request(app)
        .get('/api/v1/cierres')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual(mockCierres);
      expect(cierreService.getCierresByEmpresa).toHaveBeenCalledWith('empresa-123');
    });

    it('debería retornar 200 y el reporte dinámico si se pasa mes y año', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockReporte = { inversion_total: 1000, ingreso_total: 1500 };
      (cierreService.obtenerReporteDinamico as jest.Mock).mockResolvedValueOnce(mockReporte);

      const response = await request(app)
        .get('/api/v1/cierres?mes=6&anio=2026')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual(mockReporte);
      expect(cierreService.obtenerReporteDinamico).toHaveBeenCalledWith('empresa-123', 6, 2026);
    });
  });

  describe('POST /api/v1/cierres/generar', () => {
    it('debería retornar 201 y el cierre generado si el mes y año son válidos', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockNewCierre = { id_cierre: 'cierre-2', mes: 6, anio: 2026 };
      (cierreService.generarCierreMensual as jest.Mock).mockResolvedValueOnce(mockNewCierre);

      const response = await request(app)
        .post('/api/v1/cierres/generar')
        .set('Authorization', 'Bearer token-valido')
        .send({ mes: 6, anio: 2026 })
        .expect(201);

      expect(response.body).toEqual(mockNewCierre);
      expect(cierreService.generarCierreMensual).toHaveBeenCalledWith({
        id_empresa: 'empresa-123',
        id_usuario: 'user-123',
        mes: 6,
        anio: 2026,
      });
    });

    it('debería retornar 400 si falta el mes o el año', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);

      const response = await request(app)
        .post('/api/v1/cierres/generar')
        .set('Authorization', 'Bearer token-valido')
        .send({ mes: 6 })
        .expect(400);

      expect(response.body).toEqual({ error: 'El mes y el año son obligatorios para generar el cierre.' });
    });
  });

  describe('GET /api/v1/cierres/export', () => {
    it('debería retornar 200 y el archivo CSV si se pasa mes y año', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockCsvContent = 'id_cierre,mes,anio\ncierre-1,5,2026';
      (cierreService.exportarCSV as jest.Mock).mockResolvedValueOnce(mockCsvContent);

      const response = await request(app)
        .get('/api/v1/cierres/export?mes=5&anio=2026')
        .set('Authorization', 'Bearer token-valido')
        .expect(200)
        .expect('Content-Type', 'text/csv; charset=utf-8')
        .expect('Content-Disposition', 'attachment; filename="reporte-05-2026.csv"');

      expect(response.text).toBe(mockCsvContent);
      expect(cierreService.exportarCSV).toHaveBeenCalledWith('empresa-123', 5, 2026);
    });

    it('debería retornar 400 si falta el mes o el año', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);

      const response = await request(app)
        .get('/api/v1/cierres/export?mes=5')
        .set('Authorization', 'Bearer token-valido')
        .expect(400);

      expect(response.body).toEqual({ error: 'Los parámetros mes y año son obligatorios.' });
    });
  });
});
