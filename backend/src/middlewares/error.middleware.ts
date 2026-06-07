import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Ahora el error saldrá en rojo brillante en tu terminal
  logger.error(`[Error en la Ruta ${req.path}]: ${err.message}`);
  
  res.status(500).json({
    error: 'Ocurrió un error interno en el servidor',
    detalle: err.message
  });
};