import request from 'supertest';
import app from '../../src/app';
import { usuarioService } from '../../src/services/usuario.service';
import { verifyToken } from '../../src/utils/jwt.util';

jest.mock('../../src/services/usuario.service', () => ({
  usuarioService: {
    getUsuariosByEmpresa: jest.fn(),
    getUsuarioById: jest.fn(),
    createUsuario: jest.fn(),
    updateUsuario: jest.fn(),
    deleteUsuario: jest.fn(),
  },
}));

jest.mock('../../src/utils/jwt.util', () => ({
  verifyToken: jest.fn(),
}));

describe('Usuario Routes', () => {
  const mockTenantUser = { id_usuario: 'user-123', id_empresa: 'empresa-123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/usuarios', () => {
    it('debería retornar 200 y la lista de usuarios de la empresa', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockUsuarios = [{ id_usuario: 'user-1', nombres: 'Carlos' }];
      (usuarioService.getUsuariosByEmpresa as jest.Mock).mockResolvedValueOnce(mockUsuarios);

      const response = await request(app)
        .get('/api/v1/usuarios')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual(mockUsuarios);
      expect(usuarioService.getUsuariosByEmpresa).toHaveBeenCalledWith('empresa-123');
    });
  });

  describe('GET /api/v1/usuarios/:id', () => {
    it('debería retornar 200 y el usuario si existe', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockUsuario = { id_usuario: 'user-1', nombres: 'Carlos' };
      (usuarioService.getUsuarioById as jest.Mock).mockResolvedValueOnce(mockUsuario);

      const response = await request(app)
        .get('/api/v1/usuarios/user-1')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual(mockUsuario);
      expect(usuarioService.getUsuarioById).toHaveBeenCalledWith('user-1');
    });

    it('debería retornar 404 si el usuario no existe', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      (usuarioService.getUsuarioById as jest.Mock).mockRejectedValueOnce(new Error('Usuario no encontrado'));

      const response = await request(app)
        .get('/api/v1/usuarios/user-invalido')
        .set('Authorization', 'Bearer token-valido')
        .expect(404);

      expect(response.body).toEqual({ error: 'Usuario no encontrado' });
    });
  });

  describe('POST /api/v1/usuarios', () => {
    it('debería retornar 201 y el usuario creado sin contraseña', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const inputBody = { nombres: 'Maria', contrasena: '123456' };
      const mockCreated = { id_usuario: 'user-2', id_empresa: 'empresa-123', nombres: 'Maria', contrasena: '123456' };
      (usuarioService.createUsuario as jest.Mock).mockResolvedValueOnce(mockCreated);

      const response = await request(app)
        .post('/api/v1/usuarios')
        .set('Authorization', 'Bearer token-valido')
        .send(inputBody)
        .expect(201);

      expect(response.body).toEqual({ id_usuario: 'user-2', id_empresa: 'empresa-123', nombres: 'Maria' });
      expect(usuarioService.createUsuario).toHaveBeenCalledWith({
        id_empresa: 'empresa-123',
        nombres: 'Maria',
        contrasena: '123456',
      });
    });
  });

  describe('PUT /api/v1/usuarios/:id', () => {
    it('debería retornar 200 y el usuario actualizado', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const updateData = { nombres: 'Maria Modificado' };
      const mockUpdated = { id_usuario: 'user-2', id_empresa: 'empresa-123', nombres: 'Maria Modificado' };
      (usuarioService.updateUsuario as jest.Mock).mockResolvedValueOnce(mockUpdated);

      const response = await request(app)
        .put('/api/v1/usuarios/user-2')
        .set('Authorization', 'Bearer token-valido')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockUpdated);
      expect(usuarioService.updateUsuario).toHaveBeenCalledWith('user-2', {
        id_empresa: 'empresa-123',
        nombres: 'Maria Modificado',
      });
    });
  });

  describe('DELETE /api/v1/usuarios/:id', () => {
    it('debería retornar 200 al desactivar el usuario', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      (usuarioService.deleteUsuario as jest.Mock).mockResolvedValueOnce({ id_usuario: 'user-2', activo: false });

      const response = await request(app)
        .delete('/api/v1/usuarios/user-2')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual({ message: 'Usuario desactivado correctamente' });
      expect(usuarioService.deleteUsuario).toHaveBeenCalledWith('user-2');
    });
  });
});
