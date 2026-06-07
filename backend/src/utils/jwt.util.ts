import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Traemos tu clave secreta desde el archivo .env
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('FALTA CONFIGURAR JWT_SECRET EN EL ARCHIVO .ENV');
}

// Genera un token con los datos del usuario (Válido por 24 horas)
export const generateToken = (payload: object, expiresIn: string = '24h'): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
};

// Verifica si un token es válido, no ha expirado y no ha sido alterado
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null; // Si el token es inválido o expiró, devolvemos null
  }
};