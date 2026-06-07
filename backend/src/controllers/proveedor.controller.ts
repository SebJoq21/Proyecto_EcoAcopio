import { Request, Response } from 'express';
import { proveedorService } from '../services/proveedor.service';

export class ProveedorController {
  // GET /api/v1/proveedores?id_empresa=TU_ID_AQUI
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const id_empresa = req.query.id_empresa as string;
      
      if (!id_empresa) {
        res.status(400).json({ error: 'Falta el parámetro obligatorio id_empresa en la URL' });
        return;
      }

      const proveedores = await proveedorService.getProveedoresByEmpresa(id_empresa);
      res.json(proveedores);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const proveedor = await proveedorService.getProveedorById(id);
      res.json(proveedor);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const nuevoProveedor = await proveedorService.createProveedor(req.body);
      res.status(201).json(nuevoProveedor);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const proveedorActualizado = await proveedorService.updateProveedor(id, req.body);
      res.json(proveedorActualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await proveedorService.deleteProveedor(id);
      res.json({ message: 'Proveedor desactivado correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const proveedorController = new ProveedorController();