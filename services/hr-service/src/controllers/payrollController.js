const pool = require('../config/db');
const { calculatePayroll } = require('../services/payrollService');

async function getConfig(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM payroll_config WHERE id = 1');
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

// Lets an authorized admin update the statutory rates without touching code,
// per the "make deduction rates configurable" requirement.
async function updateConfig(req, res, next) {
  try {
    const { cnpsRate, payeRate } = req.body;
    const result = await pool.query(
      `UPDATE payroll_config SET cnps_rate = COALESCE($1, cnps_rate), paye_rate = COALESCE($2, paye_rate), updated_at = now() WHERE id = 1 RETURNING *`,
      [cnpsRate, payeRate]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function runPayroll(req, res, next) {
  try {
    const { employeeId, payPeriod, allowances = 0, otherDeductions = 0 } = req.body;
    const employee = await pool.query('SELECT * FROM employees WHERE id = $1', [employeeId]);
    if (employee.rowCount === 0) return res.status(404).json({ error: 'Employee not found' });

    const config = await pool.query('SELECT * FROM payroll_config WHERE id = 1');
    const { cnps_rate: cnpsRate, paye_rate: payeRate } = config.rows[0];

    const calc = calculatePayroll({
      basicSalary: Number(employee.rows[0].salary),
      allowances,
      otherDeductions,
      cnpsRate: Number(cnpsRate),
      payeRate: Number(payeRate),
    });

    const result = await pool.query(
      `INSERT INTO payroll_runs (employee_id, pay_period, basic_salary, allowances, gross_salary, cnps_deduction, paye_deduction, other_deductions, net_salary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (employee_id, pay_period) DO UPDATE SET
         allowances = EXCLUDED.allowances, gross_salary = EXCLUDED.gross_salary, cnps_deduction = EXCLUDED.cnps_deduction,
         paye_deduction = EXCLUDED.paye_deduction, other_deductions = EXCLUDED.other_deductions, net_salary = EXCLUDED.net_salary
       RETURNING *`,
      [employeeId, payPeriod, calc.basicSalary, calc.allowances, calc.grossSalary, calc.cnpsDeduction, calc.payeDeduction, calc.otherDeductions, calc.netSalary]
    );
    res.status(201).json({ ...result.rows[0], currency: 'FCFA' });
  } catch (err) { next(err); }
}

async function listForEmployee(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM payroll_runs WHERE employee_id = $1 ORDER BY pay_period DESC', [req.params.employeeId]);
    res.json({ currency: 'FCFA', data: result.rows });
  } catch (err) { next(err); }
}

module.exports = { getConfig, updateConfig, runPayroll, listForEmployee };
