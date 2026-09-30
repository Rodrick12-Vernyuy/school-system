const pool = require('../config/db');

async function getById(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM receipts WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Receipt not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function forInvoice(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM receipts WHERE invoice_id = $1 ORDER BY issued_at DESC', [req.params.invoiceId]);
    res.json({ data: result.rows });
  } catch (err) { next(err); }
}

module.exports = { getById, forInvoice };
