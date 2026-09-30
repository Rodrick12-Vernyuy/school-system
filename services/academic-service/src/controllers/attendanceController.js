const pool = require('../config/db');

async function record(req, res, next) {
  try {
    const { studentId, courseId, sessionDate, status } = req.body;
    const result = await pool.query(
      `INSERT INTO attendance (student_id, course_id, session_date, status, recorded_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_id, course_id, session_date)
       DO UPDATE SET status = EXCLUDED.status, recorded_by = EXCLUDED.recorded_by, recorded_at = now()
       RETURNING *`,
      [studentId, courseId, sessionDate, status, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

async function listForStudent(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT a.*, c.code, c.title FROM attendance a JOIN courses c ON c.id = a.course_id
       WHERE a.student_id = $1 ORDER BY a.session_date DESC`,
      [req.params.studentId]
    );
    const records = result.rows;
    const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
    const percentage = records.length > 0 ? +((present / records.length) * 100).toFixed(1) : null;
    res.json({ data: records, attendancePercentage: percentage });
  } catch (err) { next(err); }
}

module.exports = { record, listForStudent };
