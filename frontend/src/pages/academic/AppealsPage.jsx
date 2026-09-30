import React, { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import Pill from '../../components/Pill.jsx';
import { academicApi } from '../../api/academic.js';
import { useAuth } from '../../context/AuthContext.jsx';

const STAFF_ROLES = ['staff', 'admin', 'super_admin'];

export default function AppealsPage() {
  const { user } = useAuth();
  const isStaff = STAFF_ROLES.includes(user?.role);
  const [appeals, setAppeals] = useState([]);
  const [form, setForm] = useState({ gradeId: '', reason: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    if (isStaff) setAppeals((await academicApi.listAppeals()).data);
  };
  useEffect(() => { load(); }, [isStaff]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      await academicApi.submitAppeal(form);
      setMessage('Appeal submitted. An instructor will review it.');
      setForm({ gradeId: '', reason: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit appeal.');
    }
  };

  const decide = async (id, decision) => {
    await academicApi.reviewAppeal(id, decision);
    load();
  };

  return (
    <div>
      <h4 className="mb-4">Grade Appeals</h4>
      <div className="row">
        <div className="col-lg-7">
          <div className="table-card">
            <h6 className="mb-3">{isStaff ? 'All Appeals' : 'My Appeals'}</h6>
            <DataTable
              columns={[
                { key: 'reason', label: 'Reason' },
                { key: 'status', label: 'Status', render: (r) => <Pill status={r.status} /> },
                ...(isStaff ? [{ key: 'actions', label: '', render: (r) => r.status === 'pending' && (
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-success" onClick={() => decide(r.id, 'approved')}>Approve</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => decide(r.id, 'rejected')}>Reject</button>
                  </div>
                ) }] : []),
              ]}
              rows={appeals}
              emptyMessage="No appeals to show."
            />
          </div>
        </div>
        <div className="col-lg-5">
          <div className="table-card">
            <h6 className="mb-3">Submit an Appeal</h6>
            {message && <div className="alert alert-success py-2">{message}</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit}>
              <label className="form-label small">Grade ID (UUID)</label>
              <input className="form-control form-control-sm mb-2" required value={form.gradeId} onChange={(e) => setForm({ ...form, gradeId: e.target.value })} />
              <label className="form-label small">Reason</label>
              <textarea className="form-control form-control-sm mb-2" rows={3} required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              <button className="btn btn-primary btn-sm w-100" type="submit">Submit Appeal</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
