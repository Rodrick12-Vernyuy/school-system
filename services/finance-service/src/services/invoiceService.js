const pool = require('../config/db');

// Simplifying assumption (documented for the exam defense): tuition is
// billed per credit-hour at a flat rate. A real system would look up a
// program-specific fee schedule; that is out of scope for this academic
// project and is clearly called out here rather than hidden.
const PER_CREDIT_RATE_FCFA = parseInt(process.env.PER_CREDIT_TUITION_FCFA || '15000', 10);
const DUE_DAYS = 30;

async function nextInvoiceNumber(client) {
  const year = new Date().getFullYear();
  const result = await client.query(
    `SELECT COUNT(*) FROM invoices WHERE invoice_number LIKE $1`,
    [`INV-${year}-%`]
  );
  const sequence = parseInt(result.rows[0].count, 10) + 1;
  return `INV-${year}-${String(sequence).padStart(5, '0')}`;
}

// Consumes a STUDENT_ENROLLED event and creates a tuition invoice.
// Idempotent: if this enrollment already produced an invoice (e.g. the
// message was redelivered by RabbitMQ after a crash), it is skipped instead
// of double-billing the student.
async function createInvoiceFromEnrollmentEvent(event) {
  const eventKey = `student.enrolled:${event.enrollmentId}`;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const already = await client.query('SELECT 1 FROM processed_events WHERE event_key = $1', [eventKey]);
    if (already.rowCount > 0) {
      await client.query('ROLLBACK');
      console.log(`[finance-service] duplicate event ignored: ${eventKey}`);
      return null;
    }

    const amount = (event.credits || 3) * PER_CREDIT_RATE_FCFA;
    const invoiceNumber = await nextInvoiceNumber(client);
    const dueDate = new Date(Date.now() + DUE_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const result = await client.query(
      `INSERT INTO invoices (invoice_number, student_id, student_name, student_email, description, amount, due_date, source_enrollment_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        invoiceNumber,
        event.studentId,
        event.studentName,
        event.studentEmail,
        `Tuition fee - ${event.courseCode}: ${event.courseTitle}`,
        amount,
        dueDate,
        event.enrollmentId,
      ]
    );

    await client.query('INSERT INTO processed_events (event_key) VALUES ($1)', [eventKey]);
    await client.query('COMMIT');
    console.log(`[finance-service] created invoice ${invoiceNumber} for student ${event.studentId}`);
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { createInvoiceFromEnrollmentEvent, nextInvoiceNumber, PER_CREDIT_RATE_FCFA };
