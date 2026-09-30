const pool = require('../config/db');

async function list(req, res, next) {
  try {
    const { category, status } = req.query;
    const conditions = [];
    const params = [];
    if (category) { params.push(category); conditions.push(`category = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(`SELECT * FROM assets ${where} ORDER BY created_at DESC`, params);
    res.json({ data: result.rows });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { name, category, assignedEmployeeId, purchaseDate, value, status } = req.body;
    const result = await pool.query(
      `INSERT INTO assets (name, category, assigned_employee_id, purchase_date, value, status) VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'in_use')) RETURNING *`,
      [name, category, assignedEmployeeId || null, purchaseDate || null, value || 0, status || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { name, category, assignedEmployeeId, value, status } = req.body;
    const result = await pool.query(
      `UPDATE assets SET name = COALESCE($1, name), category = COALESCE($2, category),
        assigned_employee_id = COALESCE($3, assigned_employee_id), value = COALESCE($4, value),
        status = COALESCE($5, status), updated_at = now() WHERE id = $6 RETURNING *`,
      [name, category, assignedEmployeeId, value, status, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Asset not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

module.exports = { list, create, update };
