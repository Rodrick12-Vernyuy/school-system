process.env.JWT_ACCESS_SECRET = 'test-access-secret';
jest.mock('../src/config/db');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const pool = require('../src/config/db');
const app = require('../src/app');

const client = pool.__mockClient;
const INVOICE_ID = '44444444-4444-4444-8444-444444444444';

function studentToken() {
  return jwt.sign({ sub: 's1', email: 's@eduerp.test', role: 'student' }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

describe('POST /payments - simulated mobile money payment workflow', () => {
  beforeEach(() => jest.clearAllMocks());

  test('pays an invoice in full, updates status to paid, and issues a receipt', async () => {
    client.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: INVOICE_ID, status: 'pending', amount: '50000', amount_paid: '0', student_name: 'Jane Doe' }] }) // invoice select
      .mockResolvedValueOnce({ rows: [{ id: 'pay-1', transaction_reference: 'SIM-REF', status: 'success' }] }) // insert payment
      .mockResolvedValueOnce({ rows: [{ id: INVOICE_ID, status: 'paid', amount_paid: '50000' }] }) // update invoice
      .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // receipt count
      .mockResolvedValueOnce({ rows: [{ id: 'rec-1', receipt_number: 'RCT-2026-00001' }] }) // insert receipt
      .mockResolvedValueOnce({}); // COMMIT

    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${studentToken()}`)
      .send({ invoiceId: INVOICE_ID, amount: 50000, method: 'mtn_momo', phoneNumber: '671234567' });

    expect(res.status).toBe(201);
    expect(res.body.invoice.status).toBe('paid');
    expect(res.body.receipt.receipt_number).toBe('RCT-2026-00001');
    expect(client.query).toHaveBeenCalledWith('COMMIT');
  });

  test('rejects payment amount greater than the outstanding balance', async () => {
    client.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: INVOICE_ID, status: 'pending', amount: '50000', amount_paid: '40000' }] });

    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${studentToken()}`)
      .send({ invoiceId: INVOICE_ID, amount: 20000, method: 'mtn_momo', phoneNumber: '671234567' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/exceeds outstanding balance/);
  });

  test('records a failed payment when the simulated gateway declines', async () => {
    client.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: INVOICE_ID, status: 'pending', amount: '50000', amount_paid: '0' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'pay-2', status: 'failed' }] }) // insert payment (failed)
      .mockResolvedValueOnce({}); // COMMIT

    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${studentToken()}`)
      .send({ invoiceId: INVOICE_ID, amount: 50000, method: 'orange_money', phoneNumber: '690000000' });

    expect(res.status).toBe(402);
  });
});
