import { Request, Response } from 'express';
import { usuarioService } from '../services/usuario.service';

export class UsuarioController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const id_empresa = req.query.id_empresa as string;
      if (!id_empresa) {
        res.status(400).json({ error: 'Falta el parámetro id_empresa en la URL' });
        return;
      }
      const usuarios = await usuarioService.getUsuariosByEmpresa(id_empresa);
      res.json(usuarios);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const usuario = await usuarioService.getUsuarioById(id);
      res.json(usuario);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const nuevoUsuario = await usuarioService.createUsuario(req.body);
      
      // Excluimos la contrasena de la respuesta JSON por seguridad
      const { contrasena, ...usuarioSinPassword } = nuevoUsuario;
      res.status(201).json(usuarioSinPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const usuarioActualizado = await usuarioService.updateUsuario(id, req.body);
      res.json(usuarioActualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await usuarioService.deleteUsuario(id);
      res.json({ message: 'Usuario desactivado correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const usuarioController = new UsuarioController();