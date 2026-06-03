import { Request, Response } from 'express';
import { materialService } from '../services/material.service';

export class MaterialController {
  // GET /api/v1/materiales?id_empresa=EL_ID_AQUI
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const id_empresa = req.query.id_empresa as string;
      
      if (!id_empresa) {
        res.status(400).json({ error: 'Falta el parámetro obligatorio id_empresa en la URL' });
        return;
      }

      const materiales = await materialService.getMaterialesByEmpresa(id_empresa);
      res.json(materiales);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const material = await materialService.getMaterialById(id);
      res.json(material);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const nuevoMaterial = await materialService.createMaterial(req.body);
      res.status(201).json(nuevoMaterial);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const materialActualizado = await materialService.updateMaterial(id, req.body);
      res.json(materialActualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await materialService.deleteMaterial(id);
      res.json({ message: 'Material desactivado correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const materialController = new MaterialController();