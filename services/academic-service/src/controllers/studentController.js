const pool = require('../config/db');
const { evaluateAtRisk } = require('../services/riskService');

async function riskStatus(req, res, next) {
  try {
    const attendance = await pool.query('SELECT status FROM attendance WHERE student_id = $1', [req.params.id]);
    const grades = await pool.query(
      `SELECT g.is_passing FROM grades g JOIN enrollments e ON e.id = g.enrollment_id
       WHERE e.student_id = $1 ORDER BY g.graded_at ASC`,
      [req.params.id]
    );
    const evaluation = evaluateAtRisk({
      attendanceRecords: attendance.rows,
      gradesInChronologicalOrder: grades.rows,
    });
    res.json(evaluation);
  } catch (err) { next(err); }
}

// Resolves the academic profile belonging to the currently authenticated
// student (looked up via users.id -> students.user_id), so the frontend
// never has to know a student's internal UUID up front.
async function getMe(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'No student profile linked to this account' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(full_name ILIKE $${params.length} OR student_number ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    params.push(parseInt(limit, 10), offset);
    const result = await pool.query(
      `SELECT * FROM students ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    const countResult = await pool.query(`SELECT COUNT(*) FROM students ${where}`, params.slice(0, conditions.length));
    res.json({ data: result.rows, total: parseInt(countResult.rows[0].count, 10) });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { studentNumber, fullName, email, phone, dateOfBirth, program, level, enrollmentDate } = req.body;
    const result = await pool.query(
      `INSERT INTO students (student_number, full_name, email, phone, date_of_birth, program, level, enrollment_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, CURRENT_DATE)) RETURNING *`,
      [studentNumber, fullName, email, phone || null, dateOfBirth || null, program || null, level || null, enrollmentDate || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Student number or email already exists' });
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { fullName, email, phone, dateOfBirth, program, level, status } = req.body;
    const result = await pool.query(
      `UPDATE students SET
        full_name = COALESCE($1, full_name), email = COALESCE($2, email), phone = COALESCE($3, phone),
        date_of_birth = COALESCE($4, date_of_birth), program = COALESCE($5, program), level = COALESCE($6, level),
        status = COALESCE($7, status), updated_at = now()
       WHERE id = $8 RETURNING *`,
      [fullName, email, phone, dateOfBirth, program, level, status, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

// "Delete" deactivates rather than hard-deletes, preserving academic history
// (grades/attendance/enrollments reference the student).
async function deactivate(req, res, next) {
  try {
    const result = await pool.query(
      `UPDATE students SET status = 'inactive', updated_at = now() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, update, deactivate, riskStatus, getMe };
