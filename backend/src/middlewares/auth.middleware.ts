import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';

// Extendemos Request para que TypeScript acepte que le inyectaremos los datos del usuario
export interface AuthRequest extends Request {
  user?: any;
}

export const verifyAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // El frontend nos enviará el token en el formato: "Bearer eyJhbGciOiJIUz..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token válido.' });
    return;
  }

  const token = authHeader.split(' ')[1]; // Extraemos solo el token, quitando la palabra "Bearer"
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: 'Token inválido o expirado. Por favor, inicie sesión nuevamente.' });
    return;
  }

  // Si el token es válido, guardamos la información del usuario para que el controlador pueda usarla
  req.user = decoded; 
  next(); // Le damos pase libre para que continúe la ruta
};