import request from 'supertest';
import app from '../../src/app';
import { categoriaService } from '../../src/services/categoria.service';
import { verifyToken } from '../../src/utils/jwt.util';

jest.mock('../../src/services/categoria.service', () => ({
  categoriaService: {
    getCategoriasByEmpresa: jest.fn(),
    getCategoriaById: jest.fn(),
    createCategoria: jest.fn(),
    updateCategoria: jest.fn(),
    deleteCategoria: jest.fn(),
  },
}));

jest.mock('../../src/utils/jwt.util', () => ({
  verifyToken: jest.fn(),
}));

describe('Categoria Routes', () => {
  const mockTenantUser = { id_usuario: 'user-123', id_empresa: 'empresa-123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/categorias', () => {
    it('debería retornar 200 y la lista de categorías de la empresa', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockCategorias = [{ id_categoria: 'cat-1', nombre: 'Plásticos' }];
      (categoriaService.getCategoriasByEmpresa as jest.Mock).mockResolvedValueOnce(mockCategorias);

      const response = await request(app)
        .get('/api/v1/categorias')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual(mockCategorias);
      expect(categoriaService.getCategoriasByEmpresa).toHaveBeenCalledWith('empresa-123');
    });

    it('debería retornar 500 en caso de error interno', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      (categoriaService.getCategoriasByEmpresa as jest.Mock).mockRejectedValueOnce(new Error('Internal DB Error'));

      const response = await request(app)
        .get('/api/v1/categorias')
        .set('Authorization', 'Bearer token-valido')
        .expect(500);

      expect(response.body).toEqual({ error: 'Internal DB Error' });
    });
  });

  describe('GET /api/v1/categorias/:id', () => {
    it('debería retornar 200 y la categoría solicitada', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const mockCategoria = { id_categoria: 'cat-1', nombre: 'Plásticos' };
      (categoriaService.getCategoriaById as jest.Mock).mockResolvedValueOnce(mockCategoria);

      const response = await request(app)
        .get('/api/v1/categorias/cat-1')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual(mockCategoria);
      expect(categoriaService.getCategoriaById).toHaveBeenCalledWith('cat-1');
    });

    it('debería retornar 404 si la categoría no existe', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      (categoriaService.getCategoriaById as jest.Mock).mockRejectedValueOnce(new Error('Categoría no encontrada'));

      const response = await request(app)
        .get('/api/v1/categorias/cat-invalido')
        .set('Authorization', 'Bearer token-valido')
        .expect(404);

      expect(response.body).toEqual({ error: 'Categoría no encontrada' });
    });
  });

  describe('POST /api/v1/categorias', () => {
    it('debería retornar 201 y la categoría creada', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const inputBody = { nombre: 'Vidrio' };
      const mockCreated = { id_categoria: 'cat-2', id_empresa: 'empresa-123', nombre: 'Vidrio' };
      (categoriaService.createCategoria as jest.Mock).mockResolvedValueOnce(mockCreated);

      const response = await request(app)
        .post('/api/v1/categorias')
        .set('Authorization', 'Bearer token-valido')
        .send(inputBody)
        .expect(201);

      expect(response.body).toEqual(mockCreated);
      expect(categoriaService.createCategoria).toHaveBeenCalledWith({
        id_empresa: 'empresa-123',
        nombre: 'Vidrio',
      });
    });

    it('debería retornar 400 si falla la creación de categoría por validación', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      (categoriaService.createCategoria as jest.Mock).mockRejectedValueOnce(new Error('Ya existe una categoría con este nombre'));

      const response = await request(app)
        .post('/api/v1/categorias')
        .set('Authorization', 'Bearer token-valido')
        .send({ nombre: 'Vidrio' })
        .expect(400);

      expect(response.body).toEqual({ error: 'Ya existe una categoría con este nombre' });
    });
  });

  describe('PUT /api/v1/categorias/:id', () => {
    it('debería retornar 200 y la categoría actualizada', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      const updateData = { nombre: 'Vidrio Templado' };
      const mockUpdated = { id_categoria: 'cat-2', id_empresa: 'empresa-123', nombre: 'Vidrio Templado' };
      (categoriaService.updateCategoria as jest.Mock).mockResolvedValueOnce(mockUpdated);

      const response = await request(app)
        .put('/api/v1/categorias/cat-2')
        .set('Authorization', 'Bearer token-valido')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockUpdated);
      expect(categoriaService.updateCategoria).toHaveBeenCalledWith('cat-2', {
        id_empresa: 'empresa-123',
        nombre: 'Vidrio Templado',
      });
    });
  });

  describe('DELETE /api/v1/categorias/:id', () => {
    it('debería retornar 200 al eliminar la categoría', async () => {
      (verifyToken as jest.Mock).mockReturnValue(mockTenantUser);
      (categoriaService.deleteCategoria as jest.Mock).mockResolvedValueOnce(undefined);

      const response = await request(app)
        .delete('/api/v1/categorias/cat-2')
        .set('Authorization', 'Bearer token-valido')
        .expect(200);

      expect(response.body).toEqual({ message: 'Categoría eliminada permanentemente' });
      expect(categoriaService.deleteCategoria).toHaveBeenCalledWith('cat-2');
    });
  });
});
