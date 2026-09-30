jest.mock('../src/config/db');

const pool = require('../src/config/db');
const { createInvoiceFromEnrollmentEvent, PER_CREDIT_RATE_FCFA } = require('../src/services/invoiceService');

const client = pool.__mockClient;

const EVENT = {
  eventType: 'STUDENT_ENROLLED',
  enrollmentId: '33333333-3333-4333-8333-333333333333',
  studentId: '11111111-1111-4111-8111-111111111111',
  studentName: 'Jane Doe',
  studentEmail: 'jane@eduerp.test',
  courseId: '22222222-2222-4222-8222-222222222222',
  courseCode: 'CS101',
  courseTitle: 'Intro to CS',
  credits: 3,
};

describe('createInvoiceFromEnrollmentEvent - Finance Service side of the mandatory workflow', () => {
  beforeEach(() => jest.clearAllMocks());

  test('creates a tuition invoice priced by credit-hours, in FCFA', async () => {
    client.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rowCount: 0 }) // not already processed
      .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // invoice number sequence
      .mockResolvedValueOnce({ rows: [{ id: 'inv-1', invoice_number: 'INV-2026-00001', amount: EVENT.credits * PER_CREDIT_RATE_FCFA }] }) // insert invoice
      .mockResolvedValueOnce({}) // insert processed_events
      .mockResolvedValueOnce({}); // COMMIT

    const invoice = await createInvoiceFromEnrollmentEvent(EVENT);

    expect(invoice.id).toBe('inv-1');
    expect(invoice.amount).toBe(EVENT.credits * PER_CREDIT_RATE_FCFA);
    // Confirms the INSERT was parameterized with the amount in FCFA and tied
    // back to the originating enrollment (source_enrollment_id).
    const insertCall = client.query.mock.calls[3];
    expect(insertCall[1]).toContain(EVENT.enrollmentId);
    expect(insertCall[1]).toContain(EVENT.credits * PER_CREDIT_RATE_FCFA);
  });

  test('is idempotent: a redelivered event does not create a duplicate invoice', async () => {
    client.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rowCount: 1 }) // already processed
      .mockResolvedValueOnce({}); // ROLLBACK

    const result = await createInvoiceFromEnrollmentEvent(EVENT);
    expect(result).toBeNull();
    expect(client.query).toHaveBeenCalledTimes(3); // BEGIN, check, ROLLBACK - no INSERT
  });

  test('rolls back the transaction if the insert fails', async () => {
    client.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ count: '0' }] })
      .mockRejectedValueOnce(new Error('db exploded')); // insert invoice fails

    await expect(createInvoiceFromEnrollmentEvent(EVENT)).rejects.toThrow('db exploded');
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    expect(client.release).toHaveBeenCalled();
  });
});
