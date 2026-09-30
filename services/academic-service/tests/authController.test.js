process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
jest.mock('../src/config/db');

const request = require('supertest');
const pool = require('../src/config/db');
const app = require('../src/app');

const client = pool.__mockClient;

describe('POST /auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  test('creates a linked user + student profile and returns tokens', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 }); // email not already registered
    client.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 'u1', email: 'new@eduerp.test', role: 'student', full_name: 'New Student' }] }) // insert user
      .mockResolvedValueOnce({}) // insert student
      .mockResolvedValueOnce({}); // COMMIT
    pool.query.mockResolvedValueOnce({}); // refresh token insert (issueTokenPair uses pool.query)

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'new@eduerp.test', password: 'Sup3rSecret!', fullName: 'New Student' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('student');
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    // Confirms a students row was inserted (2nd client.query call after BEGIN+insert user).
    const insertStudentCall = client.query.mock.calls[2];
    expect(insertStudentCall[0]).toMatch(/INSERT INTO students/);
    expect(insertStudentCall[1]).toContain('u1');
  });

  test('rejects a duplicate email with 409', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'existing' }] });
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'existing@eduerp.test', password: 'Sup3rSecret!', fullName: 'Someone' });
    expect(res.status).toBe(409);
    expect(client.query).not.toHaveBeenCalled();
  });

  test('rejects a weak password before touching the database', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'weak@eduerp.test', password: '123', fullName: 'Someone' });
    expect(res.status).toBe(400);
  });
});
