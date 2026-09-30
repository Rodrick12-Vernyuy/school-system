const pool = require('../config/db');

async function list(req, res, next) {
  try {
    const { category } = req.query;
    const params = [];
    let where = '';
    if (category) { params.push(category); where = 'WHERE category = $1'; }
    const result = await pool.query(`SELECT * FROM expenses ${where} ORDER BY expense_date DESC`, params);
    res.json({ data: result.rows });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { category, description, amount, expenseDate } = req.body;
    const result = await pool.query(
      `INSERT INTO expenses (category, description, amount, expense_date, recorded_by) VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5) RETURNING *`,
      [category, description, amount, expenseDate || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { category, description, amount, expenseDate } = req.body;
    const result = await pool.query(
      `UPDATE expenses SET category = COALESCE($1, category), description = COALESCE($2, description),
        amount = COALESCE($3, amount), expense_date = COALESCE($4, expense_date), updated_at = now()
       WHERE id = $5 RETURNING *`,
      [category, description, amount, expenseDate, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Expense not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Expense not found' });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };
