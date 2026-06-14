import { Request, Response } from 'express';
import { auditoriaService } from '../services/auditoria.service';

export class AuditoriaController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      // Priorizamos el body o query dependiendo de dónde inyecte la info el middleware
      const id_empresa = req.body.id_empresa || (req.query.id_empresa as string);
      
      if (!id_empresa) {
        res.status(400).json({ error: 'El id_empresa es obligatorio para acceder al historial.' });
        return;
      }

      const logs = await auditoriaService.obtenerHistorial(id_empresa);
      res.status(200).json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const auditoriaController = new AuditoriaController();