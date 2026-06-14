import { Request, Response } from 'express';
import { cierreService } from '../services/cierre.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class CierreController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const id_empresa = req.query.id_empresa as string;
      const mes = req.query.mes as string;
      const anio = req.query.anio as string;

      if (mes && anio) {
        const reporte = await cierreService.obtenerReporteDinamico(id_empresa, Number(mes), Number(anio));
        res.json(reporte);
        return;
      }

      const cierres = await cierreService.getCierresByEmpresa(id_empresa);
      res.json(cierres);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async generar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { mes, anio } = req.body;
      const id_empresa = req.body.id_empresa;
      const id_usuario = req.user?.id_usuario;

      if (!mes || !anio) {
        res.status(400).json({ error: 'El mes y el año son obligatorios para generar el cierre.' });
        return;
      }

      const nuevoCierre = await cierreService.generarCierreMensual({
        id_empresa,
        id_usuario,
        mes: Number(mes),
        anio: Number(anio)
      });

      res.status(201).json(nuevoCierre);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async exportarCSV(req: Request, res: Response): Promise<void> {
    try {
      const id_empresa = req.query.id_empresa as string;
      const mes = req.query.mes as string;
      const anio = req.query.anio as string;

      if (!mes || !anio) {
        res.status(400).json({ error: 'Los parámetros mes y año son obligatorios.' });
        return;
      }

      const csv = await cierreService.exportarCSV(id_empresa, Number(mes), Number(anio));

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="reporte-${String(mes).padStart(2, '0')}-${anio}.csv"`);
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const cierreController = new CierreController();
