import { Request, Response } from 'express';
import { inventarioService } from '../services/inventario.service';

export class InventarioController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const id_empresa = req.query.id_empresa as string;
      const inventario = await inventarioService.getInventarioByEmpresa(id_empresa);
      res.json(inventario);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateMinimo(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { stock_minimo_kg } = req.body;

      if (stock_minimo_kg === undefined || stock_minimo_kg < 0) {
        res.status(400).json({ error: 'El stock mínimo es requerido y debe ser un número igual o mayor a 0' });
        return;
      }

      const actualizado = await inventarioService.updateStockMinimo(id, stock_minimo_kg);
      res.json(actualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const inventarioController = new InventarioController();