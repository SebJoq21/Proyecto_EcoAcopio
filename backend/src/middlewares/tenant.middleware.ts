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
  // De esta forma, nuestros controladores que exigen req.query.id_empresa o req.body.id_empresa 
  // seguirán funcionando perfectamente sin necesidad de modificarles el código.
  
  req.query.id_empresa = req.user.id_empresa;
  
  if (req.body && typeof req.body === 'object') {
    req.body.id_empresa = req.user.id_empresa;
  }

  next();
};