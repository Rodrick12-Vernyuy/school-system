import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import Pill from '../../components/Pill.jsx';
import RowAvatar from '../../components/RowAvatar.jsx';
import { hrApi } from '../../api/hr.js';

const emptyForm = { employeeNumber: '', fullName: '', email: '', department: '', position: '', salary: '' };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => setEmployees((await hrApi.listEmployees()).data);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await hrApi.createEmployee({ ...form, salary: Number(form.salary) });
      setForm(emptyForm);
      setMessage('Employee added. Their QR attendance token was generated automatically.');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add employee.');
    }
  };

  const deactivate = async (id) => {
    if (!confirm('Deactivate this employee?')) return;
    await hrApi.deactivateEmployee(id);
    load();
  };

  return (
    <div>
      <h4 className="mb-4">Employee Management</h4>
      <div className="row">
        <div className="col-lg-8">
          <div className="table-card">
            <DataTable
              columns={[
                { key: 'full_name', label: 'Employee', render: (r) => <RowAvatar name={r.full_name} sub={r.employee_number} /> },
                { key: 'department', label: 'Department' },
                { key: 'position', label: 'Position' },
                { key: 'salary', label: 'Salary (FCFA)', render: (r) => Number(r.salary).toLocaleString() },
                { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
                { key: 'qr_code_token', label: 'QR Token', render: (r) => <code className="small">{r.qr_code_token.slice(0, 10)}…</code> },
                { key: 'actions', label: '', render: (r) => (
                  <button className="btn btn-sm btn-outline-danger" disabled={r.status !== 'active'} onClick={() => deactivate(r.id)}>Deactivate</button>
                ) },
              ]}
              rows={employees}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="table-card">
            <h6 className="mb-3">Add Employee</h6>
            {message && <div className="alert alert-success py-2">{message}</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit}>
              <input className="form-control form-control-sm mb-2" placeholder="Employee Number" required value={form.employeeNumber} onChange={(e) => setForm({ ...form, employeeNumber: e.target.value })} />
              <input className="form-control form-control-sm mb-2" placeholder="Full Name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <input className="form-control form-control-sm mb-2" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="form-control form-control-sm mb-2" placeholder="Department" required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              <input className="form-control form-control-sm mb-2" placeholder="Position" required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              <input className="form-control form-control-sm mb-2" type="number" placeholder="Salary (FCFA)" required value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
              <button className="btn btn-primary btn-sm w-100" type="submit">Add Employee</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
