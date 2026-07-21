import { pesajeService } from '../../src/services/pesaje.service';
import { pesajeRepository } from '../../src/repositories/pesaje.repository';
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

// Mock de pesajeRepository
jest.mock('../../src/repositories/pesaje.repository', () => ({
  pesajeRepository: {
    findAllByEmpresa: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  },
}));

const mockTx = {
  inventario: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  pesaje: {
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('PesajeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTransaction.mockImplementation((callback) => callback(mockTx));
  });

  describe('getPesajesByEmpresa', () => {
    it('debería retornar los pesajes de la empresa', async () => {
      const mockPesajes = [{ id_pesaje: '1', peso_kg: 100 }];
      (pesajeRepository.findAllByEmpresa as jest.Mock).mockResolvedValueOnce(mockPesajes);

      const result = await pesajeService.getPesajesByEmpresa('empresa-123');

      expect(result).toEqual(mockPesajes);
      expect(pesajeRepository.findAllByEmpresa).toHaveBeenCalledWith('empresa-123');
    });
  });

  describe('getPesajeById', () => {
    it('debería retornar el pesaje si existe', async () => {
      const mockPesaje = { id_pesaje: '1', peso_kg: 100 };
      (pesajeRepository.findById as jest.Mock).mockResolvedValueOnce(mockPesaje);

      const result = await pesajeService.getPesajeById('1');

      expect(result).toEqual(mockPesaje);
      expect(pesajeRepository.findById).toHaveBeenCalledWith('1');
    });

    it('debería lanzar un error si el pesaje no existe', async () => {
      (pesajeRepository.findById as jest.Mock).mockResolvedValueOnce(null);

      await expect(pesajeService.getPesajeById('1'))
        .rejects
        .toThrow('Ticket de pesaje no encontrado');
    });
  });

  describe('createPesaje', () => {
    const pesajeDto = {
      id_empresa: 'empresa-123',
      id_material: 'material-123',
      id_proveedor: 'proveedor-123',
      id_usuario: 'usuario-123',
      peso_kg: 50.00,
      total_pagado: 100.00,
      tipo_movimiento: 'COMPRA',
    };

    it('debería lanzar un error si el tipo de movimiento no es COMPRA ni VENTA', async () => {
      const invalidDto = { ...pesajeDto, tipo_movimiento: 'OTRO' };
      mockTx.inventario.findFirst.mockResolvedValueOnce(null);

      await expect(pesajeService.createPesaje(invalidDto))
        .rejects
        .toThrow('El tipo de movimiento debe ser COMPRA o VENTA');
    });

    it('debería registrar una COMPRA y actualizar el inventario existente', async () => {
      const inventarioExistente = { id_inventario: 'inv-1', stock_kg: 100 };
      mockTx.inventario.findFirst.mockResolvedValueOnce(inventarioExistente);
      mockTx.inventario.update.mockResolvedValueOnce({});
      
      const expectedPesaje = { id_pesaje: 'p-new', ...pesajeDto };
      mockTx.pesaje.create.mockResolvedValueOnce(expectedPesaje);

      const result = await pesajeService.createPesaje(pesajeDto);

      expect(mockTx.inventario.findFirst).toHaveBeenCalledWith({
        where: { id_empresa: 'empresa-123', id_material: 'material-123' },
      });
      expect(mockTx.inventario.update).toHaveBeenCalledWith({
        where: { id_inventario: 'inv-1' },
        data: { stock_kg: { increment: 50.00 } },
      });
      expect(mockTx.pesaje.create).toHaveBeenCalledWith({ data: pesajeDto });
      expect(result).toEqual(expectedPesaje);
    });

    it('debería registrar una COMPRA y crear una nueva fila de inventario si no existe', async () => {
      mockTx.inventario.findFirst.mockResolvedValueOnce(null);
      mockTx.inventario.create.mockResolvedValueOnce({});
      
      const expectedPesaje = { id_pesaje: 'p-new', ...pesajeDto };
      mockTx.pesaje.create.mockResolvedValueOnce(expectedPesaje);

      const result = await pesajeService.createPesaje(pesajeDto);

      expect(mockTx.inventario.create).toHaveBeenCalledWith({
        data: {
          id_empresa: 'empresa-123',
          id_material: 'material-123',
          stock_kg: 50.00,
        },
      });
      expect(mockTx.pesaje.create).toHaveBeenCalledWith({ data: pesajeDto });
      expect(result).toEqual(expectedPesaje);
    });

    it('debería lanzar un error si se intenta registrar una VENTA de un material sin inventario previo', async () => {
      const ventaDto = { ...pesajeDto, tipo_movimiento: 'VENTA' };
      mockTx.inventario.findFirst.mockResolvedValueOnce(null);

      await expect(pesajeService.createPesaje(ventaDto))
        .rejects
        .toThrow('No puedes registrar una VENTA de un material que no existe en tu inventario.');
    });

    it('debería lanzar un error si se intenta registrar una VENTA y el stock es insuficiente', async () => {
      const ventaDto = { ...pesajeDto, tipo_movimiento: 'VENTA', peso_kg: 80 };
      const inventarioExistente = { id_inventario: 'inv-1', stock_kg: 50 };
      mockTx.inventario.findFirst.mockResolvedValueOnce(inventarioExistente);

      await expect(pesajeService.createPesaje(ventaDto))
        .rejects
        .toThrow('Stock insuficiente. Intentas vender 80kg pero solo hay 50kg disponibles.');
    });

    it('debería registrar una VENTA y restar el peso del inventario si hay stock suficiente', async () => {
      const ventaDto = { ...pesajeDto, tipo_movimiento: 'VENTA', peso_kg: 40 };
      const inventarioExistente = { id_inventario: 'inv-1', stock_kg: 50 };
      mockTx.inventario.findFirst.mockResolvedValueOnce(inventarioExistente);
      mockTx.inventario.update.mockResolvedValueOnce({});
      
      const expectedPesaje = { id_pesaje: 'p-new', ...ventaDto };
      mockTx.pesaje.create.mockResolvedValueOnce(expectedPesaje);

      const result = await pesajeService.createPesaje(ventaDto);

      expect(mockTx.inventario.update).toHaveBeenCalledWith({
        where: { id_inventario: 'inv-1' },
        data: { stock_kg: { increment: -40 } },
      });
      expect(result).toEqual(expectedPesaje);
    });
  });

  describe('updatePesaje', () => {
    it('debería actualizar el pesaje', async () => {
      const mockPesaje = { id_pesaje: '1', peso_kg: 100 };
      (pesajeRepository.findById as jest.Mock).mockResolvedValueOnce(mockPesaje);
      (pesajeRepository.update as jest.Mock).mockResolvedValueOnce({ ...mockPesaje, peso_kg: 120 });

      const result = await pesajeService.updatePesaje('1', { peso_kg: 120 });

      expect(pesajeRepository.update).toHaveBeenCalledWith('1', { peso_kg: 120 });
      expect(result.peso_kg).toBe(120);
    });
  });

  describe('anularPesaje', () => {
    it('debería lanzar un error si el pesaje ya está anulado', async () => {
      const mockPesaje = { id_pesaje: '1', estado: 'ANULADO' };
      (pesajeRepository.findById as jest.Mock).mockResolvedValueOnce(mockPesaje);

      await expect(pesajeService.anularPesaje('1'))
        .rejects
        .toThrow('Este ticket de pesaje ya se encuentra anulado.');
    });

    it('debería lanzar un error si no se encuentra el inventario asociado', async () => {
      const mockPesaje = { id_pesaje: '1', estado: 'Completado', id_empresa: 'empresa-1', id_material: 'mat-1', peso_kg: 50, tipo_movimiento: 'COMPRA' };
      (pesajeRepository.findById as jest.Mock).mockResolvedValueOnce(mockPesaje);
      mockTx.inventario.findFirst.mockResolvedValueOnce(null);

      await expect(pesajeService.anularPesaje('1'))
        .rejects
        .toThrow('No se encontró el inventario asociado a este material para revertir la operación.');
    });

    it('debería lanzar un error al anular COMPRA si no hay suficiente stock para la reversión', async () => {
      const mockPesaje = { id_pesaje: '1', estado: 'Completado', id_empresa: 'empresa-1', id_material: 'mat-1', peso_kg: 100, tipo_movimiento: 'COMPRA' };
      const mockInventario = { id_inventario: 'inv-1', stock_kg: 50 };
      (pesajeRepository.findById as jest.Mock).mockResolvedValueOnce(mockPesaje);
      mockTx.inventario.findFirst.mockResolvedValueOnce(mockInventario);

      await expect(pesajeService.anularPesaje('1'))
        .rejects
        .toThrow('No puedes anular esta COMPRA. Intentas restar 100kg, pero tu stock actual es de solo 50kg. (Quizás ya vendiste este material).');
    });

    it('debería anular una COMPRA y restar el peso del inventario correctamente', async () => {
      const mockPesaje = { id_pesaje: '1', estado: 'Completado', id_empresa: 'empresa-1', id_material: 'mat-1', peso_kg: 40, tipo_movimiento: 'COMPRA' };
      const mockInventario = { id_inventario: 'inv-1', stock_kg: 50 };
      (pesajeRepository.findById as jest.Mock).mockResolvedValueOnce(mockPesaje);
      mockTx.inventario.findFirst.mockResolvedValueOnce(mockInventario);
      mockTx.inventario.update.mockResolvedValueOnce({});
      mockTx.pesaje.update.mockResolvedValueOnce({ ...mockPesaje, estado: 'Anulado' });

      const result = await pesajeService.anularPesaje('1');

      expect(mockTx.inventario.update).toHaveBeenCalledWith({
        where: { id_inventario: 'inv-1' },
        data: { stock_kg: { increment: -40 } },
      });
      expect(mockTx.pesaje.update).toHaveBeenCalledWith({
        where: { id_pesaje: '1' },
        data: { estado: 'Anulado' },
      });
      expect(result.estado).toBe('Anulado');
    });

    it('debería anular una VENTA y sumar el peso de vuelta al inventario', async () => {
      const mockPesaje = { id_pesaje: '1', estado: 'Completado', id_empresa: 'empresa-1', id_material: 'mat-1', peso_kg: 30, tipo_movimiento: 'VENTA' };
      const mockInventario = { id_inventario: 'inv-1', stock_kg: 20 };
      (pesajeRepository.findById as jest.Mock).mockResolvedValueOnce(mockPesaje);
      mockTx.inventario.findFirst.mockResolvedValueOnce(mockInventario);
      mockTx.inventario.update.mockResolvedValueOnce({});
      mockTx.pesaje.update.mockResolvedValueOnce({ ...mockPesaje, estado: 'Anulado' });

      const result = await pesajeService.anularPesaje('1');

      expect(mockTx.inventario.update).toHaveBeenCalledWith({
        where: { id_inventario: 'inv-1' },
        data: { stock_kg: { increment: 30 } },
      });
      expect(mockTx.pesaje.update).toHaveBeenCalledWith({
        where: { id_pesaje: '1' },
        data: { estado: 'Anulado' },
      });
      expect(result.estado).toBe('Anulado');
    });
  });
});
