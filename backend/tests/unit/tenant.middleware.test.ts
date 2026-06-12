import { verifyTenant } from '../../src/middlewares/tenant.middleware';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../src/middlewares/auth.middleware';

describe('verifyTenant Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('debería retornar 403 si el objeto req.user no existe (falta autenticación previa)', () => {
    mockRequest.user = undefined; // No logueado

    verifyTenant(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Acceso denegado. El usuario no tiene una empresa asignada.',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('debería retornar 403 si req.user existe pero no contiene id_empresa', () => {
    mockRequest.user = { id_usuario: 'user-123' }; // No tiene empresa vinculada

    verifyTenant(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Acceso denegado. El usuario no tiene una empresa asignada.',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('debería inyectar id_empresa en req.query y req.body y llamar a next() si req.user.id_empresa es válido', () => {
    const testEmpresaId = 'empresa-uuid-999';
    mockRequest.user = { id_usuario: 'user-123', id_empresa: testEmpresaId };
    mockRequest.query = {};
    mockRequest.body = { campo: 'valor' };

    verifyTenant(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    // Verificamos inyección en queries y body
    expect(mockRequest.query.id_empresa).toBe(testEmpresaId);
    expect(mockRequest.body.id_empresa).toBe(testEmpresaId);

    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('debería inyectar id_empresa en req.query incluso si req.body es nulo o vacío', () => {
    const testEmpresaId = 'empresa-uuid-999';
    mockRequest.user = { id_usuario: 'user-123', id_empresa: testEmpresaId };
    mockRequest.query = {};
    mockRequest.body = undefined; // Sin body (típico en peticiones GET)

    verifyTenant(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockRequest.query.id_empresa).toBe(testEmpresaId);
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });
});
