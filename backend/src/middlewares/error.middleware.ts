import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error en el Servidor]:', err.message);
  
  res.status(500).json({
    error: 'Ocurrió un error interno en el servidor',
    detalle: err.message
  });
};