const pool = require('../config/db');

async function submit(req, res, next) {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ error: 'endDate cannot be before startDate' });
    }
    const result = await pool.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [employeeId, leaveType || 'annual', startDate, endDate, reason || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

async function listForEmployee(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM leave_requests WHERE employee_id = $1 ORDER BY created_at DESC', [req.params.employeeId]);
    res.json({ data: result.rows });
  } catch (err) { next(err); }
}

async function listPending(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT l.*, e.full_name, e.department FROM leave_requests l JOIN employees e ON e.id = l.employee_id
       WHERE l.status = 'pending' ORDER BY l.created_at ASC`
    );
    res.json({ data: result.rows });
  } catch (err) { next(err); }
}

async function review(req, res, next) {
  try {
    const { decision } = req.body; // 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ error: 'decision must be approved or rejected' });
    }
    const result = await pool.query(
      `UPDATE leave_requests SET status = $1, reviewed_by = $2, reviewed_at = now()
       WHERE id = $3 AND status = 'pending' RETURNING *`,
      [decision, req.user.id, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Leave request not found or already reviewed' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

module.exports = { submit, listForEmployee, listPending, review };
