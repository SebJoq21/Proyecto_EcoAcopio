import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, contrasena } = req.body;

      if (!email || !contrasena) {
        res.status(400).json({ error: 'El email y la contraseña son obligatorios.' });
        return;
      }

      const datosAcceso = await authService.login(email, contrasena);
      res.json(datosAcceso);
    } catch (error: any) {
      // 401 significa "No Autorizado" (Unauthorized)
      res.status(401).json({ error: error.message });
    }
  }
}

export const authController = new AuthController();