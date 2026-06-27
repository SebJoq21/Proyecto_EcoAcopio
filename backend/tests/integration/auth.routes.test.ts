import request from 'supertest';
import app from '../../src/app';
import { authService } from '../../src/services/auth.service';
import { usuarioRepository } from '../../src/repositories/usuario.repository';
import { verifyToken } from '../../src/utils/jwt.util';

jest.mock('../../src/services/auth.service', () => ({
  authService: {
    login: jest.fn(),
  },
}));

jest.mock('../../src/repositories/usuario.repository', () => ({
  usuarioRepository: {
    findById: jest.fn(),
  },
}));

jest.mock('../../src/utils/jwt.util', () => ({
  verifyToken: jest.fn(),
}));

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/login', () => {
    it('debería retornar 400 si falta el email o la contraseña', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toEqual({ error: 'El email y la contraseña son obligatorios.' });
    });

    it('debería retornar 200 y los datos de acceso en un login exitoso', async () => {
      const mockAccessData = { token: 'mock-token', user: { id: '1', email: 'test@example.com' } };
      (authService.login as jest.Mock).mockResolvedValueOnce(mockAccessData);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(200);

      expect(response.body).toEqual(mockAccessData);
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('debería retornar 401 si las credenciales son incorrectas', async () => {
      (authService.login as jest.Mock).mockRejectedValueOnce(new Error('Credenciales inválidas.'));

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' })
        .expect(401);

      expect(response.body).toEqual({ error: 'Credenciales inválidas.' });
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('debería retornar 401 si no se proporciona un token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body).toEqual({ error: 'Acceso denegado. No se proporcionó un token válido.' });
    });

    it('debería retornar 200 y los datos del usuario si el token es válido', async () => {
      const mockUserDecoded = { id_usuario: 'user-123', id_empresa: 'empresa-123' };
      const mockUserDb = { id_usuario: 'user-123', nombres: 'Juan', email: 'juan@example.com' };

      (verifyToken as jest.Mock).mockReturnValueOnce(mockUserDecoded);
      (usuarioRepository.findById as jest.Mock).mockResolvedValueOnce(mockUserDb);

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({ usuario: mockUserDb });
      expect(verifyToken).toHaveBeenCalledWith('valid-token');
      expect(usuarioRepository.findById).toHaveBeenCalledWith('user-123');
    });

    it('debería retornar 404 si el usuario logueado ya no existe en la base de datos', async () => {
      const mockUserDecoded = { id_usuario: 'user-123', id_empresa: 'empresa-123' };

      (verifyToken as jest.Mock).mockReturnValueOnce(mockUserDecoded);
      (usuarioRepository.findById as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body).toEqual({ error: 'Usuario no encontrado.' });
    });
  });
});
