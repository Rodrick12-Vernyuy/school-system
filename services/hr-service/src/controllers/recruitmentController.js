const pool = require('../config/db');

async function list(req, res, next) {
  try {
    const { status } = req.query;
    const params = [];
    let where = '';
    if (status) { params.push(status); where = 'WHERE status = $1'; }
    const result = await pool.query(`SELECT * FROM recruitment ${where} ORDER BY application_date DESC`, params);
    res.json({ data: result.rows });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { candidateName, candidateEmail, position, applicationDate } = req.body;
    const result = await pool.query(
      `INSERT INTO recruitment (candidate_name, candidate_email, position, application_date) VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE)) RETURNING *`,
      [candidateName, candidateEmail || null, position, applicationDate || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE recruitment SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Candidate not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

module.exports = { list, create, updateStatus };
