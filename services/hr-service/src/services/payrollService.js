// Pure payroll calculation, kept separate from the DB/controller layer so it
// is trivially unit-testable and so the formula is easy to point to and
// defend in an exam.
//
// IMPORTANT / documented assumption: cnpsRate and payeRate are configurable
// placeholder rates (see payroll_config table / GET+PUT /payroll/config).
// They are NOT verified against current Cameroonian CNPS/PAYE legislation.
// A real deployment must have these rates confirmed by a qualified
// accountant/payroll officer before going live - this is explicitly
// simulated for the academic project, as required by the assignment brief.
function calculatePayroll({ basicSalary, allowances = 0, otherDeductions = 0, cnpsRate, payeRate }) {
  const grossSalary = round2(basicSalary + allowances);
  const cnpsDeduction = round2(grossSalary * cnpsRate);
  const payeDeduction = round2(grossSalary * payeRate);
  const netSalary = round2(grossSalary - cnpsDeduction - payeDeduction - otherDeductions);
  return {
    basicSalary: round2(basicSalary),
    allowances: round2(allowances),
    grossSalary,
    cnpsDeduction,
    payeDeduction,
    otherDeductions: round2(otherDeductions),
    netSalary,
  };
}

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

module.exports = { calculatePayroll };
