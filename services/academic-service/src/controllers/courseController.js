const pool = require('../config/db');

async function list(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY code ASC');
    res.json({ data: result.rows });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const course = await pool.query('SELECT * FROM courses WHERE id = $1', [req.params.id]);
    if (course.rowCount === 0) return res.status(404).json({ error: 'Course not found' });
    const prereqs = await pool.query(
      `SELECT c.* FROM course_prerequisites cp JOIN courses c ON c.id = cp.prerequisite_course_id WHERE cp.course_id = $1`,
      [req.params.id]
    );
    res.json({ ...course.rows[0], prerequisites: prereqs.rows });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { code, title, description, credits, capacity } = req.body;
    const result = await pool.query(
      `INSERT INTO courses (code, title, description, credits, capacity) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [code, title, description || null, credits || 3, capacity || 40]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Course code already exists' });
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { title, description, credits, capacity } = req.body;
    const result = await pool.query(
      `UPDATE courses SET title = COALESCE($1, title), description = COALESCE($2, description),
        credits = COALESCE($3, credits), capacity = COALESCE($4, capacity), updated_at = now()
       WHERE id = $5 RETURNING *`,
      [title, description, credits, capacity, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Course not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Course not found' });
    res.status(204).send();
  } catch (err) {
    if (err.code === '23503') return res.status(409).json({ error: 'Cannot delete a course with existing enrollments' });
    next(err);
  }
}

async function assignPrerequisite(req, res, next) {
  try {
    const { prerequisiteCourseId } = req.body;
    if (prerequisiteCourseId === req.params.id) {
      return res.status(400).json({ error: 'A course cannot be its own prerequisite' });
    }
    await pool.query(
      `INSERT INTO course_prerequisites (course_id, prerequisite_course_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [req.params.id, prerequisiteCourseId]
    );
    res.status(201).json({ courseId: req.params.id, prerequisiteCourseId });
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, update, remove, assignPrerequisite };
