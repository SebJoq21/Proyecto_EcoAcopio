import request from 'supertest';
import app from '../../src/app';

describe('GET /api/v1/health', () => {
  it('debería retornar status 200 y status ok', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });
});
