import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { hrApi } from '../../api/hr.js';

export default function PayrollPage() {
  const [config, setConfig] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [runForm, setRunForm] = useState({ employeeId: '', payPeriod: new Date().toISOString().slice(0, 7), allowances: '0', otherDeductions: '0' });
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setConfig(await hrApi.getPayrollConfig());
    setEmployees((await hrApi.listEmployees()).data);
  };
  useEffect(() => { load(); }, []);

  const saveConfig = async (e) => {
    e.preventDefault();
    await hrApi.updatePayrollConfig({ cnpsRate: Number(config.cnps_rate), payeRate: Number(config.paye_rate) });
    setMessage('Statutory deduction rates updated.');
  };

  const runPayroll = async (e) => {
    e.preventDefault();
    setError(''); setResult(null);
    try {
      const res = await hrApi.runPayroll({
        ...runForm,
        allowances: Number(runForm.allowances),
        otherDeductions: Number(runForm.otherDeductions),
      });
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not run payroll.');
    }
  };

  return (
    <div>
      <h4 className="mb-4">Payroll</h4>
      <div className="alert alert-warning small">
        CNPS and PAYE rates below are configurable PLACEHOLDER values for this academic demo - they are NOT verified
        against current legislation. See the payroll_config table / README for details.
      </div>
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="table-card">
            <h6 className="mb-3">Statutory Rates</h6>
            {config && (
              <form onSubmit={saveConfig}>
                <label className="form-label small">CNPS Rate</label>
                <input className="form-control form-control-sm mb-2" type="number" step="0.0001" value={config.cnps_rate}
                  onChange={(e) => setConfig({ ...config, cnps_rate: e.target.value })} />
                <label className="form-label small">PAYE Rate</label>
                <input className="form-control form-control-sm mb-2" type="number" step="0.0001" value={config.paye_rate}
                  onChange={(e) => setConfig({ ...config, paye_rate: e.target.value })} />
                <button className="btn btn-outline-primary btn-sm w-100" type="submit">Save Rates</button>
              </form>
            )}
            {message && <div className="alert alert-success py-2 mt-2">{message}</div>}
          </div>
        </div>
        <div className="col-lg-8 mb-4">
          <div className="table-card">
            <h6 className="mb-3">Run Payroll</h6>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={runPayroll} className="row g-2 align-items-end">
              <div className="col-md-4">
                <label className="form-label small">Employee</label>
                <select className="form-select form-select-sm" required value={runForm.employeeId} onChange={(e) => setRunForm({ ...runForm, employeeId: e.target.value })}>
                  <option value="">Select…</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small">Pay Period</label>
                <input className="form-control form-control-sm" type="month" required value={runForm.payPeriod} onChange={(e) => setRunForm({ ...runForm, payPeriod: e.target.value })} />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Allowances</label>
                <input className="form-control form-control-sm" type="number" value={runForm.allowances} onChange={(e) => setRunForm({ ...runForm, allowances: e.target.value })} />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Other Ded.</label>
                <input className="form-control form-control-sm" type="number" value={runForm.otherDeductions} onChange={(e) => setRunForm({ ...runForm, otherDeductions: e.target.value })} />
              </div>
              <div className="col-md-1">
                <button className="btn btn-primary btn-sm w-100" type="submit">Run</button>
              </div>
            </form>
            {result && (
              <div className="mt-3">
                <DataTable
                  columns={[
                    { key: 'basic_salary', label: 'Basic', render: (r) => Number(r.basic_salary).toLocaleString() },
                    { key: 'gross_salary', label: 'Gross', render: (r) => Number(r.gross_salary).toLocaleString() },
                    { key: 'cnps_deduction', label: 'CNPS', render: (r) => Number(r.cnps_deduction).toLocaleString() },
                    { key: 'paye_deduction', label: 'PAYE', render: (r) => Number(r.paye_deduction).toLocaleString() },
                    { key: 'net_salary', label: 'Net (FCFA)', render: (r) => Number(r.net_salary).toLocaleString() },
                  ]}
                  rows={[result]}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
