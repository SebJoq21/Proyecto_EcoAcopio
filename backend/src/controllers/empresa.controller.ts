import { Request, Response } from 'express';
import { empresaService } from '../services/empresa.service';

export class EmpresaController {
  async getAll(req: Request, res: Response) {
    try {
      const empresas = await empresaService.getAllEmpresas();
      res.json(empresas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string; 
      const empresa = await empresaService.getEmpresaById(id);
      res.json(empresa);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const nuevaEmpresa = await empresaService.createEmpresa(req.body);
      res.status(201).json(nuevaEmpresa);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string; 
      const empresaActualizada = await empresaService.updateEmpresa(id, req.body);
      res.json(empresaActualizada);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string; 
      await empresaService.deleteEmpresa(id);
      res.json({ message: 'Empresa desactivada correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

// Exportamos la instancia para usarla en las rutas
export const empresaController = new EmpresaController();