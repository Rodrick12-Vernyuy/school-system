const pool = require('../config/db');

async function summary(req, res, next) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [totalEmployees, presentToday, pendingLeave, payrollThisMonth, avgPerformance, totalAssets] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM employees WHERE status = 'active'`),
      pool.query('SELECT COUNT(*) FROM hr_attendance WHERE attendance_date = $1', [today]),
      pool.query(`SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'`),
      pool.query(
        `SELECT COALESCE(SUM(net_salary), 0) AS total FROM payroll_runs WHERE pay_period = $1`,
        [today.slice(0, 7)]
      ),
      pool.query('SELECT COALESCE(AVG(score), 0) AS avg FROM performance_reviews'),
      pool.query('SELECT COUNT(*) FROM assets'),
    ]);
    res.json({
      totalEmployees: parseInt(totalEmployees.rows[0].count, 10),
      employeesPresentToday: parseInt(presentToday.rows[0].count, 10),
      pendingLeaveRequests: parseInt(pendingLeave.rows[0].count, 10),
      payrollSummaryThisMonth: { currency: 'FCFA', totalNetSalary: Number(payrollThisMonth.rows[0].total) },
      averagePerformanceScore: Number(Number(avgPerformance.rows[0].avg).toFixed(2)),
      totalAssets: parseInt(totalAssets.rows[0].count, 10),
    });
  } catch (err) { next(err); }
}

module.exports = { summary };
