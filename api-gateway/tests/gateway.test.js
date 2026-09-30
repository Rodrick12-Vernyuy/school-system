process.env.JWT_ACCESS_SECRET = 'test-access-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

describe('API Gateway', () => {
  test('GET /health reports ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('api-gateway');
  });

  test('protected academic route rejects requests with no token', async () => {
    const res = await request(app).get('/api/v1/academic/students');
    expect(res.status).toBe(401);
  });

  test('protected finance route rejects requests with an invalid token', async () => {
    const res = await request(app).get('/api/v1/finance/invoices').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  test('unknown route returns 404 with a helpful message', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/Route not found/);
  });

  test('a valid token passes the gateway edge check (proxy then fails to reach a real upstream, which is expected in this unit test)', async () => {
    const token = jwt.sign({ sub: 'u1', role: 'admin' }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const res = await request(app).get('/api/v1/hr/employees').set('Authorization', `Bearer ${token}`);
    // No real hr-service is running in this unit test, so the proxy itself
    // will fail to connect (502) rather than the gateway rejecting the
    // token (401) - this proves verifyToken let the valid token through.
    expect(res.status).not.toBe(401);
  });
});
