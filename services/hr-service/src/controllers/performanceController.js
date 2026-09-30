const pool = require('../config/db');

async function record(req, res, next) {
  try {
    const { employeeId, score, reviewDate, comments } = req.body;
    const result = await pool.query(
      `INSERT INTO performance_reviews (employee_id, score, review_date, comments, reviewed_by) VALUES ($1, $2, COALESCE($3, CURRENT_DATE), $4, $5) RETURNING *`,
      [employeeId, score, reviewDate || null, comments || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

async function listForEmployee(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM performance_reviews WHERE employee_id = $1 ORDER BY review_date DESC', [req.params.employeeId]);
    res.json({ data: result.rows });
  } catch (err) { next(err); }
}

module.exports = { record, listForEmployee };
