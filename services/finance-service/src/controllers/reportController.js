const pool = require('../config/db');

async function dailySummary(req, res, next) {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const income = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'success' AND paid_at::date = $1`,
      [date]
    );
    const expenses = await pool.query('SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE expense_date = $1', [date]);
    res.json({
      date,
      currency: 'FCFA',
      income: Number(income.rows[0].total),
      expenses: Number(expenses.rows[0].total),
      net: Number(income.rows[0].total) - Number(expenses.rows[0].total),
    });
  } catch (err) { next(err); }
}

async function monthlySummary(req, res, next) {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7); // YYYY-MM
    const income = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'success' AND to_char(paid_at, 'YYYY-MM') = $1`,
      [month]
    );
    const expenses = await pool.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE to_char(expense_date, 'YYYY-MM') = $1`, [month]);
    res.json({
      month,
      currency: 'FCFA',
      income: Number(income.rows[0].total),
      expenses: Number(expenses.rows[0].total),
      net: Number(income.rows[0].total) - Number(expenses.rows[0].total),
    });
  } catch (err) { next(err); }
}

async function outstandingFees(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, invoice_number, student_id, student_name, amount, amount_paid,
              (amount - amount_paid) AS outstanding, due_date, status
       FROM invoices WHERE status IN ('pending', 'partially_paid', 'overdue') ORDER BY due_date ASC`
    );
    const totalOutstanding = result.rows.reduce((sum, r) => sum + Number(r.outstanding), 0);
    res.json({ currency: 'FCFA', totalOutstanding, data: result.rows });
  } catch (err) { next(err); }
}

async function expenseReport(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT category, COALESCE(SUM(amount), 0) AS total FROM expenses GROUP BY category ORDER BY total DESC`
    );
    res.json({ currency: 'FCFA', data: result.rows });
  } catch (err) { next(err); }
}

module.exports = { dailySummary, monthlySummary, outstandingFees, expenseReport };
