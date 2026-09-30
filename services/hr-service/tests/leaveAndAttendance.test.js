process.env.JWT_ACCESS_SECRET = 'test-access-secret';
jest.mock('../src/config/db');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const pool = require('../src/config/db');
const app = require('../src/app');

const EMPLOYEE_ID = '55555555-5555-4555-8555-555555555555';

function tokenFor(role) {
  return jwt.sign({ sub: 'hr1', email: 'hr@eduerp.test', role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

describe('Leave management', () => {
  beforeEach(() => jest.clearAllMocks());

  test('employee can submit a leave request', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 'leave-1', employee_id: EMPLOYEE_ID, status: 'pending' }],
      rowCount: 1,
    });
    const res = await request(app)
      .post('/leave')
      .set('Authorization', `Bearer ${tokenFor('staff')}`)
      .send({ employeeId: EMPLOYEE_ID, startDate: '2026-10-01', endDate: '2026-10-05', reason: 'Family event' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
  });

  test('rejects a leave request where endDate is before startDate', async () => {
    const res = await request(app)
      .post('/leave')
      .set('Authorization', `Bearer ${tokenFor('staff')}`)
      .send({ employeeId: EMPLOYEE_ID, startDate: '2026-10-10', endDate: '2026-10-05' });
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('HR/admin can approve a pending leave request', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 'leave-1', status: 'approved' }], rowCount: 1 });
    const res = await request(app)
      .patch('/leave/leave-1')
      .set('Authorization', `Bearer ${tokenFor('admin')}`)
      .send({ decision: 'approved' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
  });

  test('a plain staff-only endpoint rejects a student role', async () => {
    const res = await request(app)
      .get('/leave/pending')
      .set('Authorization', `Bearer ${tokenFor('student')}`);
    expect(res.status).toBe(403);
  });
});

describe('QR-code attendance check-in', () => {
  beforeEach(() => jest.clearAllMocks());

  test('valid QR token records a check-in', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: EMPLOYEE_ID, full_name: 'Amina Bello' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: 'att-1', employee_id: EMPLOYEE_ID }], rowCount: 1 });

    const res = await request(app)
      .post('/attendance/check-in')
      .set('Authorization', `Bearer ${tokenFor('staff')}`)
      .send({ qrToken: 'abc123token' });

    expect(res.status).toBe(201);
    expect(res.body.employee.full_name).toBe('Amina Bello');
  });

  test('unknown QR token is rejected', async () => {
    pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await request(app)
      .post('/attendance/check-in')
      .set('Authorization', `Bearer ${tokenFor('staff')}`)
      .send({ qrToken: 'does-not-exist' });
    expect(res.status).toBe(404);
  });

  test('a second check-in on the same day is rejected (already checked in)', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: EMPLOYEE_ID, full_name: 'Amina Bello' }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // ON CONFLICT DO NOTHING -> no row returned

    const res = await request(app)
      .post('/attendance/check-in')
      .set('Authorization', `Bearer ${tokenFor('staff')}`)
      .send({ qrToken: 'abc123token' });

    expect(res.status).toBe(409);
  });
});
