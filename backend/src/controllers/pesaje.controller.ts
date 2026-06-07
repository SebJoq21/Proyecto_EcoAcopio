import { Request, Response } from 'express';
import { pesajeService } from '../services/pesaje.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class PesajeController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const id_empresa = req.query.id_empresa as string;
      const pesajes = await pesajeService.getPesajesByEmpresa(id_empresa);
      res.json(pesajes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const pesaje = await pesajeService.getPesajeById(id);
      res.json(pesaje);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      // SEGURIDAD: Inyectamos obligatoriamente el id del usuario logueado en el cuerpo
      // para saber exactamente quién realizó esta transacción.
      if (req.user && req.user.id_usuario) {
        req.body.id_usuario = req.user.id_usuario;
      }

      const nuevoPesaje = await pesajeService.createPesaje(req.body);
      res.status(201).json(nuevoPesaje);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const pesajeActualizado = await pesajeService.updatePesaje(id, req.body);
      res.json(pesajeActualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async anular(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await pesajeService.anularPesaje(id);
      res.json({ message: 'Ticket de pesaje anulado correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const pesajeController = new PesajeController();