const { calculatePayroll } = require('../src/services/payrollService');

describe('calculatePayroll', () => {
  test('computes gross, statutory deductions, and net salary in FCFA', () => {
    const result = calculatePayroll({
      basicSalary: 300000,
      allowances: 50000,
      otherDeductions: 5000,
      cnpsRate: 0.042,
      payeRate: 0.10,
    });
    expect(result.grossSalary).toBe(350000);
    expect(result.cnpsDeduction).toBe(14700); // 350000 * 0.042
    expect(result.payeDeduction).toBe(35000); // 350000 * 0.10
    expect(result.netSalary).toBe(350000 - 14700 - 35000 - 5000);
  });

  test('rates are parameters, not hard-coded - changing them changes the result', () => {
    const low = calculatePayroll({ basicSalary: 200000, cnpsRate: 0.01, payeRate: 0.05 });
    const high = calculatePayroll({ basicSalary: 200000, cnpsRate: 0.10, payeRate: 0.20 });
    expect(low.netSalary).toBeGreaterThan(high.netSalary);
  });

  test('handles zero allowances and deductions', () => {
    const result = calculatePayroll({ basicSalary: 100000, cnpsRate: 0.042, payeRate: 0.1 });
    expect(result.allowances).toBe(0);
    expect(result.otherDeductions).toBe(0);
    expect(result.grossSalary).toBe(100000);
  });
});
