const pool = require('../config/db');

async function list(req, res, next) {
  try {
    const { status, studentId, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const params = [];
    if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
    if (studentId) { params.push(studentId); conditions.push(`student_id = $${params.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    params.push(parseInt(limit, 10), offset);
    const result = await pool.query(
      `SELECT * FROM invoices ${where} ORDER BY issue_date DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ data: result.rows });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Invoice not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function forStudent(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM invoices WHERE student_id = $1 ORDER BY issue_date DESC', [req.params.studentId]);
    res.json({ data: result.rows });
  } catch (err) { next(err); }
}

async function markOverdue(req, res, next) {
  // Utility endpoint (admin/staff) to sweep past-due pending invoices.
  try {
    const result = await pool.query(
      `UPDATE invoices SET status = 'overdue', updated_at = now()
       WHERE status IN ('pending', 'partially_paid') AND due_date < CURRENT_DATE RETURNING id`
    );
    res.json({ updated: result.rowCount });
  } catch (err) { next(err); }
}

module.exports = { list, getById, forStudent, markOverdue };
