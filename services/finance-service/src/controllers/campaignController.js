const pool = require('../config/db');

function withMetrics(campaign) {
  const conversionRate = campaign.leads > 0 ? +((campaign.conversions / campaign.leads) * 100).toFixed(2) : 0;
  const roi = Number(campaign.budget) > 0
    ? +(((Number(campaign.revenue) - Number(campaign.budget)) / Number(campaign.budget)) * 100).toFixed(2)
    : 0;
  return { ...campaign, conversionRate, roi };
}

async function list(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM campaigns ORDER BY start_date DESC');
    res.json({ data: result.rows.map(withMetrics) });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { name, description, startDate, endDate, budget } = req.body;
    const result = await pool.query(
      `INSERT INTO campaigns (name, description, start_date, end_date, budget) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description || null, startDate, endDate, budget || 0]
    );
    res.status(201).json(withMetrics(result.rows[0]));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { leads, conversions, revenue, budget } = req.body;
    const result = await pool.query(
      `UPDATE campaigns SET leads = COALESCE($1, leads), conversions = COALESCE($2, conversions),
        revenue = COALESCE($3, revenue), budget = COALESCE($4, budget), updated_at = now()
       WHERE id = $5 RETURNING *`,
      [leads, conversions, revenue, budget, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Campaign not found' });
    res.json(withMetrics(result.rows[0]));
  } catch (err) { next(err); }
}

module.exports = { list, create, update, withMetrics };
