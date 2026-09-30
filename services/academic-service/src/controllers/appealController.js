const pool = require('../config/db');

async function submit(req, res, next) {
  try {
    const { gradeId, reason } = req.body;
    const grade = await pool.query(
      `SELECT g.*, e.student_id FROM grades g JOIN enrollments e ON e.id = g.enrollment_id WHERE g.id = $1`,
      [gradeId]
    );
    if (grade.rowCount === 0) return res.status(404).json({ error: 'Grade not found' });
    // A student may only appeal their own grade.
    if (req.user.role === 'student') {
      const studentRow = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (studentRow.rowCount === 0 || studentRow.rows[0].id !== grade.rows[0].student_id) {
        return res.status(403).json({ error: 'You may only appeal your own grades' });
      }
    }
    const result = await pool.query(
      `INSERT INTO grade_appeals (grade_id, student_id, reason) VALUES ($1, $2, $3) RETURNING *`,
      [gradeId, grade.rows[0].student_id, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

async function review(req, res, next) {
  try {
    const { decision } = req.body; // 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ error: 'decision must be approved or rejected' });
    }
    const result = await pool.query(
      `UPDATE grade_appeals SET status = $1, reviewed_by = $2, reviewed_at = now()
       WHERE id = $3 AND status = 'pending' RETURNING *`,
      [decision, req.user.id, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Appeal not found or already reviewed' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const result = await pool.query(`SELECT * FROM grade_appeals ORDER BY created_at DESC`);
    res.json({ data: result.rows });
  } catch (err) { next(err); }
}

module.exports = { submit, review, list };
