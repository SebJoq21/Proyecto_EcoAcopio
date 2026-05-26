import { Request, Response } from 'express';
import { categoriaService } from '../services/categoria.service';

export class CategoriaController {
  // GET /api/v1/categorias?id_empresa=AQUI_VA_EL_ID
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const id_empresa = req.query.id_empresa as string;
      
      if (!id_empresa) {
        res.status(400).json({ error: 'El parámetro id_empresa es obligatorio en la URL' });
        return;
      }

      const categorias = await categoriaService.getCategoriasByEmpresa(id_empresa);
      res.json(categorias);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const categoria = await categoriaService.getCategoriaById(id);
      res.json(categoria);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const nuevaCategoria = await categoriaService.createCategoria(req.body);
      res.status(201).json(nuevaCategoria);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const categoriaActualizada = await categoriaService.updateCategoria(id, req.body);
      res.json(categoriaActualizada);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await categoriaService.deleteCategoria(id);
      res.json({ message: 'Categoría eliminada permanentemente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const categoriaController = new CategoriaController();