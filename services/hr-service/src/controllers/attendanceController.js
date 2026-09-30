// QR-code attendance: each employee has a stable qr_code_token (generated at
// creation time, see schema.sql). In the real UI, this token is rendered as
// a QR code image; scanning it (or, for demo purposes, typing it into a
// simple input) posts the token here to record a check-in for today.
const pool = require('../config/db');

async function checkIn(req, res, next) {
  try {
    const { qrToken } = req.body;
    const employee = await pool.query('SELECT id, full_name FROM employees WHERE qr_code_token = $1 AND status = $2', [qrToken, 'active']);
    if (employee.rowCount === 0) {
      return res.status(404).json({ error: 'QR code not recognized or employee inactive' });
    }
    const today = new Date().toISOString().slice(0, 10);
    const result = await pool.query(
      `INSERT INTO hr_attendance (employee_id, attendance_date) VALUES ($1, $2)
       ON CONFLICT (employee_id, attendance_date) DO NOTHING RETURNING *`,
      [employee.rows[0].id, today]
    );
    if (result.rowCount === 0) {
      return res.status(409).json({ error: `${employee.rows[0].full_name} has already checked in today` });
    }
    res.status(201).json({ employee: employee.rows[0], attendance: result.rows[0] });
  } catch (err) { next(err); }
}

async function listForDate(req, res, next) {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const result = await pool.query(
      `SELECT a.*, e.full_name, e.employee_number, e.department FROM hr_attendance a
       JOIN employees e ON e.id = a.employee_id WHERE a.attendance_date = $1 ORDER BY a.check_in_time`,
      [date]
    );
    res.json({ date, data: result.rows });
  } catch (err) { next(err); }
}

module.exports = { checkIn, listForDate };
