process.env.JWT_ACCESS_SECRET = 'test-access-secret';

jest.mock('../src/config/db');
jest.mock('../src/config/rabbitmq');

const request = require('supertest');
const pool = require('../src/config/db');
const { publishEvent } = require('../src/config/rabbitmq');
const app = require('../src/app');
const { signAccessToken } = require('../src/services/authService');

const STUDENT_ID = '11111111-1111-4111-8111-111111111111';
const COURSE_ID = '22222222-2222-4222-8222-222222222222';
const ENROLLMENT_ID = '33333333-3333-4333-8333-333333333333';

describe('POST /enrollments - the mandatory async enrollment -> invoice workflow', () => {
  let token;

  beforeEach(() => {
    jest.clearAllMocks();
    token = signAccessToken({ id: 'u1', email: 'staff@eduerp.test', role: 'staff', full_name: 'Staff User' });
  });

  test('creates the enrollment and publishes STUDENT_ENROLLED to RabbitMQ', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: STUDENT_ID, full_name: 'Jane Doe', email: 'jane@eduerp.test' }], rowCount: 1 }) // student lookup
      .mockResolvedValueOnce({ rows: [{ id: COURSE_ID, code: 'CS101', title: 'Intro to CS', credits: 3, capacity: 40 }], rowCount: 1 }) // course lookup
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // prerequisites (none)
      .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // capacity check
      .mockResolvedValueOnce({ rows: [{ id: ENROLLMENT_ID, student_id: STUDENT_ID, course_id: COURSE_ID, status: 'enrolled' }], rowCount: 1 }); // insert enrollment

    const res = await request(app)
      .post('/enrollments')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: STUDENT_ID, courseId: COURSE_ID });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(ENROLLMENT_ID);

    // This is the crux of the mandatory workflow: enrolling must publish
    // a student.enrolled event so the Finance Service can create an invoice.
    expect(publishEvent).toHaveBeenCalledTimes(1);
    const [routingKey, payload] = publishEvent.mock.calls[0];
    expect(routingKey).toBe('student.enrolled');
    expect(payload.eventType).toBe('STUDENT_ENROLLED');
    expect(payload.studentId).toBe(STUDENT_ID);
    expect(payload.courseId).toBe(COURSE_ID);
  });

  test('rejects enrollment when the course is at capacity', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: STUDENT_ID }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: COURSE_ID, capacity: 1 }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const res = await request(app)
      .post('/enrollments')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: STUDENT_ID, courseId: COURSE_ID });

    expect(res.status).toBe(409);
    expect(publishEvent).not.toHaveBeenCalled();
  });

  test('rejects requests without a valid access token', async () => {
    const res = await request(app).post('/enrollments').send({ studentId: STUDENT_ID, courseId: COURSE_ID });
    expect(res.status).toBe(401);
  });
});
