import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const verifyTenant = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Verificamos que el auth.middleware ya haya hecho su trabajo
  if (!req.user || !req.user.id_empresa) {
    res.status(403).json({ error: 'Acceso denegado. El usuario no tiene una empresa asignada.' });
    return;
  }

  // TRUCO ARQUITECTÓNICO: 
  // Inyectamos el id_empresa de forma obligatoria en las consultas (Query) y en el cuerpo (Body)
  
  const queryModificada = { ...req.query, id_empresa: req.user.id_empresa };
  Object.defineProperty(req, 'query', {
    value: queryModificada,
    writable: true,
    configurable: true,
    enumerable: true
  });
  
  if (req.body && typeof req.body === 'object') {
    req.body.id_empresa = req.user.id_empresa;
  }

  next();
};