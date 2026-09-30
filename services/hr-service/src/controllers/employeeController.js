const pool = require('../config/db');

async function list(req, res, next) {
  try {
    const { search, department, status } = req.query;
    const conditions = [];
    const params = [];
    if (search) { params.push(`%${search}%`); conditions.push(`(full_name ILIKE $${params.length} OR employee_number ILIKE $${params.length})`); }
    if (department) { params.push(department); conditions.push(`department = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(`SELECT * FROM employees ${where} ORDER BY created_at DESC`, params);
    res.json({ data: result.rows });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM employees WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { employeeNumber, fullName, email, phone, department, position, salary, employmentDate } = req.body;
    const result = await pool.query(
      `INSERT INTO employees (employee_number, full_name, email, phone, department, position, salary, employment_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, CURRENT_DATE)) RETURNING *`,
      [employeeNumber, fullName, email, phone || null, department, position, salary, employmentDate || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Employee number or email already exists' });
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { fullName, email, phone, department, position, salary } = req.body;
    const result = await pool.query(
      `UPDATE employees SET full_name = COALESCE($1, full_name), email = COALESCE($2, email), phone = COALESCE($3, phone),
        department = COALESCE($4, department), position = COALESCE($5, position), salary = COALESCE($6, salary), updated_at = now()
       WHERE id = $7 RETURNING *`,
      [fullName, email, phone, department, position, salary, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function deactivate(req, res, next) {
  try {
    const result = await pool.query(`UPDATE employees SET status = 'inactive', updated_at = now() WHERE id = $1 RETURNING *`, [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, update, deactivate };
