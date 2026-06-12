import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { usuarioRepository } from '../repositories/usuario.repository';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      // ✅ Corregido: Extraemos 'password' tal cual viene desde el payload del frontend
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'El email y la contraseña son obligatorios.' });
        return;
      }

      // ✅ Enviamos el 'password' al método correspondiente en tu authService
      const datosAcceso = await authService.login(email, password);
      res.json(datosAcceso);
    } catch (error: any) {
      // 401 significa "No Autorizado" (Unauthorized)
      res.status(401).json({ error: error.message });
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as any;
      if (!authReq.user || !authReq.user.id_usuario) {
        res.status(401).json({ error: 'No autorizado.' });
        return;
      }

      const usuario = await usuarioRepository.findById(authReq.user.id_usuario);
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado.' });
        return;
      }

      res.json({ usuario });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const authController = new AuthController();