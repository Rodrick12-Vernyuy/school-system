// Simulated mobile-money payment workflow:
//   Student selects invoice -> chooses MTN MoMo / Orange Money ->
//   enters simulated phone number -> payment processed ->
//   invoice updated -> digital receipt generated.
const pool = require('../config/db');
const { simulateMobileMoneyCharge } = require('../services/mockPaymentGateway');

function nextReceiptNumber(sequence) {
  const year = new Date().getFullYear();
  return `RCT-${year}-${String(sequence).padStart(5, '0')}`;
}

async function pay(req, res, next) {
  const { invoiceId, amount, method, phoneNumber } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const invoiceResult = await client.query('SELECT * FROM invoices WHERE id = $1 FOR UPDATE', [invoiceId]);
    if (invoiceResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const invoice = invoiceResult.rows[0];
    if (invoice.status === 'paid') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invoice is already fully paid' });
    }
    const outstanding = Number(invoice.amount) - Number(invoice.amount_paid);
    if (amount > outstanding) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Amount exceeds outstanding balance of ${outstanding} FCFA` });
    }

    const charge = simulateMobileMoneyCharge({ method, phoneNumber });

    const paymentResult = await client.query(
      `INSERT INTO payments (invoice_id, amount, method, phone_number, transaction_reference, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [invoiceId, amount, method, phoneNumber, charge.transactionReference, charge.success ? 'success' : 'failed']
    );
    const payment = paymentResult.rows[0];

    if (!charge.success) {
      await client.query('COMMIT');
      return res.status(402).json({ error: charge.message, payment });
    }

    const newAmountPaid = Number(invoice.amount_paid) + Number(amount);
    const newStatus = newAmountPaid >= Number(invoice.amount) ? 'paid' : 'partially_paid';
    const updatedInvoice = await client.query(
      `UPDATE invoices SET amount_paid = $1, status = $2, updated_at = now() WHERE id = $3 RETURNING *`,
      [newAmountPaid, newStatus, invoiceId]
    );

    const countResult = await client.query('SELECT COUNT(*) FROM receipts');
    const receiptNumber = nextReceiptNumber(parseInt(countResult.rows[0].count, 10) + 1);
    const receiptResult = await client.query(
      `INSERT INTO receipts (receipt_number, payment_id, invoice_id, student_name, amount, method, transaction_reference)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [receiptNumber, payment.id, invoiceId, invoice.student_name, amount, method, charge.transactionReference]
    );

    await client.query('COMMIT');
    return res.status(201).json({
      payment,
      invoice: updatedInvoice.rows[0],
      receipt: receiptResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return next(err);
  } finally {
    client.release();
  }
}

module.exports = { pay };
