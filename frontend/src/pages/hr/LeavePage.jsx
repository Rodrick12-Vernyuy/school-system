import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { hrApi } from '../../api/hr.js';

const emptyForm = { employeeId: '', leaveType: 'annual', startDate: '', endDate: '', reason: '' };

export default function LeavePage() {
  const [pending, setPending] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setPending((await hrApi.listPendingLeave()).data);
    setEmployees((await hrApi.listEmployees()).data);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await hrApi.submitLeave(form);
      setMessage('Leave request submitted.');
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit leave request.');
    }
  };

  const review = async (id, decision) => {
    await hrApi.reviewLeave(id, decision);
    load();
  };

  return (
    <div>
      <h4 className="mb-4">Leave Management</h4>
      <div className="row">
        <div className="col-lg-8">
          <div className="table-card">
            <h6 className="mb-3">Pending Requests</h6>
            <DataTable
              columns={[
                { key: 'full_name', label: 'Employee' },
                { key: 'leave_type', label: 'Type' },
                { key: 'start_date', label: 'Start' },
                { key: 'end_date', label: 'End' },
                { key: 'actions', label: '', render: (r) => (
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-success" onClick={() => review(r.id, 'approved')}>Approve</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => review(r.id, 'rejected')}>Reject</button>
                  </div>
                ) },
              ]}
              rows={pending}
              emptyMessage="No pending leave requests."
            />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="table-card">
            <h6 className="mb-3">Submit Leave Request</h6>
            {message && <div className="alert alert-success py-2">{message}</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit}>
              <select className="form-select form-select-sm mb-2" required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
                <option value="">Employee…</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
              </select>
              <select className="form-select form-select-sm mb-2" value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
                <option value="annual">Annual</option>
                <option value="sick">Sick</option>
                <option value="maternity">Maternity</option>
                <option value="unpaid">Unpaid</option>
              </select>
              <input className="form-control form-control-sm mb-2" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              <input className="form-control form-control-sm mb-2" type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              <textarea className="form-control form-control-sm mb-2" placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              <button className="btn btn-primary btn-sm w-100" type="submit">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
