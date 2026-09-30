const pool = require('../config/db');

function letterGradeFor(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  if (score >= 50) return 'E';
  return 'F';
}

const PASSING_THRESHOLD = 50;

async function enter(req, res, next) {
  try {
    const { enrollmentId, score } = req.body;
    const letterGrade = letterGradeFor(score);
    const isPassing = score >= PASSING_THRESHOLD;
    const result = await pool.query(
      `INSERT INTO grades (enrollment_id, score, letter_grade, is_passing, graded_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [enrollmentId, score, letterGrade, isPassing, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { score } = req.body;
    const letterGrade = letterGradeFor(score);
    const isPassing = score >= PASSING_THRESHOLD;
    const result = await pool.query(
      `UPDATE grades SET score = $1, letter_grade = $2, is_passing = $3, graded_by = $4, graded_at = now()
       WHERE id = $5 RETURNING *`,
      [score, letterGrade, isPassing, req.user.id, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Grade not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function listForStudent(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT g.*, c.code, c.title, c.credits FROM grades g
       JOIN enrollments e ON e.id = g.enrollment_id
       JOIN courses c ON c.id = e.course_id
       WHERE e.student_id = $1 ORDER BY g.graded_at ASC`,
      [req.params.studentId]
    );
    const grades = result.rows;
    const gpaScale = { A: 4, B: 3, C: 2, D: 1, E: 0.5, F: 0 };
    const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);
    const gpaPoints = grades.reduce((sum, g) => sum + gpaScale[g.letter_grade] * g.credits, 0);
    const gpa = totalCredits > 0 ? +(gpaPoints / totalCredits).toFixed(2) : null;
    res.json({ data: grades, gpa });
  } catch (err) { next(err); }
}

module.exports = { enter, update, listForStudent, letterGradeFor, PASSING_THRESHOLD };
