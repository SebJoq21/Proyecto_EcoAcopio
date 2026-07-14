import { cierreService } from '../../src/services/cierre.service';
import { cierreRepository } from '../../src/repositories/cierre.repository';
import prisma from '../../src/config/prisma';

// Creamos un mock stub de transaction que redirecciona a un mock local
const mockTransaction = jest.fn();

// Mock de Prisma utilizando el stub
jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    $transaction: (...args: any[]) => mockTransaction(...args),
  },
}));

// Mock de cierreRepository
jest.mock('../../src/repositories/cierre.repository', () => ({
  cierreRepository: {
    findAllByEmpresa: jest.fn(),
    findPesajesByPeriodo: jest.fn(),
    findByPeriodo: jest.fn(),
  },
}));

const mockTx = {
  pesaje: {
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
  cierreMensual: {
    create: jest.fn(),
  },
};

describe('CierreService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTransaction.mockImplementation((callback) => callback(mockTx));
  });

  describe('getCierresByEmpresa', () => {
    it('debería retornar todos los cierres de una empresa', async () => {
      const mockCierres = [{ id_cierre: '1', mes: 1, anio: 2026 }];
      (cierreRepository.findAllByEmpresa as jest.Mock).mockResolvedValueOnce(mockCierres);

      const result = await cierreService.getCierresByEmpresa('empresa-123');

      expect(result).toEqual(mockCierres);
      expect(cierreRepository.findAllByEmpresa).toHaveBeenCalledWith('empresa-123');
    });
  });

  describe('obtenerReporteDinamico', () => {
    it('debería retornar el reporte dinámico calculado correctamente', async () => {
      const idEmpresa = 'empresa-123';
      const mes = 7;
      const anio = 2026;

      const mockPesajes = [
        { peso_kg: '100.50', tipo_movimiento: 'compra' },
        { peso_kg: '50.00', tipo_movimiento: 'venta' },
        { peso_kg: '20.00', tipo_movimiento: 'entrada' },
        { peso_kg: '10.25', tipo_movimiento: 'salida' },
      ];

      (cierreRepository.findPesajesByPeriodo as jest.Mock).mockResolvedValueOnce(mockPesajes);

      const result = await cierreService.obtenerReporteDinamico(idEmpresa, mes, anio);

      expect(cierreRepository.findPesajesByPeriodo).toHaveBeenCalledWith(
        idEmpresa,
        new Date(2026, 6, 1),
        new Date(2026, 7, 1)
      );

      expect(result.total_entradas).toBe(120.5);
      expect(result.total_salidas).toBe(60.25);
      expect(result.transacciones).toBe(4);
      expect(result.balance_neto).toBe(60.25);
      expect(result.detalles).toEqual(mockPesajes);
    });
  });

  describe('generarCierreMensual', () => {
    const cierreDto = {
      id_empresa: 'empresa-123',
      id_usuario: 'usuario-123',
      mes: 7,
      anio: 2026,
    };

    it('debería lanzar un error si el cierre contable ya existe para ese periodo', async () => {
      (cierreRepository.findByPeriodo as jest.Mock).mockResolvedValueOnce({ id_cierre: 'existing' });

      await expect(cierreService.generarCierreMensual(cierreDto))
        .rejects
        .toThrow('El cierre contable para el mes 7 del año 2026 ya fue generado previamente.');

      expect(cierreRepository.findByPeriodo).toHaveBeenCalledWith('empresa-123', 7, 2026);
    });

    it('debería generar el cierre mensual y actualizar los pesajes exitosamente', async () => {
      (cierreRepository.findByPeriodo as jest.Mock).mockResolvedValueOnce(null);

      const mockPesajes = [
        { id_pesaje: 'p1', peso_kg: '150.00', total_pagado: '300.00', tipo_movimiento: 'compra' },
        { id_pesaje: 'p2', peso_kg: '50.00', total_pagado: '200.00', tipo_movimiento: 'venta' },
      ];

      mockTx.pesaje.findMany.mockResolvedValueOnce(mockPesajes);
      
      const expectedCierre = { id_cierre: 'cierre-nuevo', ...cierreDto };
      mockTx.cierreMensual.create.mockResolvedValueOnce(expectedCierre);
      mockTx.pesaje.updateMany.mockResolvedValueOnce({ count: 2 });

      const result = await cierreService.generarCierreMensual(cierreDto);

      expect(mockTransaction).toHaveBeenCalled();
      expect(mockTx.pesaje.findMany).toHaveBeenCalledWith({
        where: {
          id_empresa: 'empresa-123',
          estado: 'Completado',
          fecha_creacion: {
            gte: new Date(2026, 6, 1),
            lt: new Date(2026, 7, 1),
          },
        },
      });

      expect(mockTx.cierreMensual.create).toHaveBeenCalledWith({
        data: {
          id_empresa: 'empresa-123',
          id_usuario: 'usuario-123',
          mes: 7,
          anio: 2026,
          total_kilos_comprados: 150,
          total_kilos_vendidos: 50,
          inversion_total: 300,
          ingreso_total: 200,
        },
      });

      expect(mockTx.pesaje.updateMany).toHaveBeenCalledWith({
        where: {
          id_pesaje: { in: ['p1', 'p2'] },
        },
        data: {
          id_cierre: 'cierre-nuevo',
        },
      });

      expect(result).toEqual(expectedCierre);
    });
  });

  describe('exportarCSV', () => {
    it('debería retornar los datos de pesajes formateados como CSV', async () => {
      const mockPesajes = [
        {
          fecha_creacion: new Date('2026-07-05T12:00:00Z'),
          material: { nombre: 'Plástico, PET' },
          proveedor: { nombre_completo: 'Juan, Pérez' },
          peso_kg: '120.50',
          tipo_movimiento: 'compra',
        },
        {
          fecha_creacion: '2026-07-06T14:00:00Z',
          material: { nombre: 'Cartón' },
          proveedor: { nombre_completo: 'María Gómez' },
          peso_kg: '80.00',
          tipo_movimiento: 'venta',
        },
      ];

      (cierreRepository.findPesajesByPeriodo as jest.Mock).mockResolvedValueOnce(mockPesajes);

      const csvResult = await cierreService.exportarCSV('empresa-123', 7, 2026);

      const lineas = csvResult.split('\n');
      expect(lineas[0]).toBe('Fecha,Material,Proveedor,Peso (kg),Tipo');
      expect(lineas[1]).toContain('Plástico  PET');
      expect(lineas[1]).toContain('Juan  Pérez');
      expect(lineas[1]).toContain('120.50');
      expect(lineas[1]).toContain('Entrada');
      
      expect(lineas[2]).toContain('Cartón');
      expect(lineas[2]).toContain('María Gómez');
      expect(lineas[2]).toContain('80.00');
      expect(lineas[2]).toContain('Salida');
    });
  });
});
