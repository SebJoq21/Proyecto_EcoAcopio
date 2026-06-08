import { Request } from 'express';

export type UserRole = 'admin' | 'operador';

export interface JwtPayload {
  id: string | number;
  email: string;
  role: UserRole;
  nombre: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}